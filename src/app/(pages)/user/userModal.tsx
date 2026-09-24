"use client";

import UpdateModalConfirmation from "@/components/confirmation/updateModalConfirmation";
import { createSimpleUser } from "@/lib/service/user/create-users-service";
import { updateUser } from "@/lib/service/user/update-user-service";
import { UserData } from "@/types/user";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  Phone,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userToEdit?: UserData | null;
}

const compressAndConvertToBase64 = (
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.85,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/webp", quality);
        resolve(compressedBase64);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function UserModal({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}: UserModalProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [name, setName] = useState<string>("");
  const [smartphone, setSmartphone] = useState<string>("");
  const [mail, setMail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [createdUserDetails, setCreatedUserDetails] = useState<{
    name: string;
    mail: string;
  } | null>(null);

  const [showUpdateSuccessModal, setShowUpdateSuccessModal] =
    useState<boolean>(false);

  const isEditMode = Boolean(userToEdit);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  const resetForm = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setName("");
    setSmartphone("");
    setMail("");
    setPassword("");
    setConfirmPassword("");
    setSelectedImage(null);
    setImagePreview(null);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    setShowSuccessModal(false);
    setShowUpdateSuccessModal(false);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!isEditMode) {
      if (password !== confirmPassword) {
        setErrorMessage("Les mots de passe ne correspondent pas.");
        return;
      }

      if (password.length < 6) {
        setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
    }

    setLoading(true);

    try {
      let imageUrl = "";

      if (selectedImage) {
        imageUrl = await compressAndConvertToBase64(selectedImage);
      } else if (imagePreview) {
        imageUrl = imagePreview;
      } else {
        imageUrl = "";
      }

      let formattedPhone = smartphone.trim().replace(/\s+/g, "");
      if (formattedPhone !== "") {
        if (formattedPhone.startsWith("0")) {
          formattedPhone = "+261" + formattedPhone.substring(1);
        } else if (!formattedPhone.startsWith("+")) {
          formattedPhone = "+" + formattedPhone;
        }
      }

      const cleanMail = mail.trim().toLowerCase();

      if (isEditMode && userToEdit) {
        await updateUser({
          userId: userToEdit.idUser,
          name,
          smartphone: formattedPhone,
          mail: cleanMail,
          image: imageUrl,
        });

        setShowUpdateSuccessModal(true);
      } else {
        await createSimpleUser({
          name,
          smartphone: formattedPhone,
          mail: cleanMail,
          password,
          responsability: "simple",
          image: imageUrl,
        });

        setCreatedUserDetails({
          name,
          mail: cleanMail,
        });
        setShowSuccessModal(true);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Erreur handleSubmit :", error);
      const err = error as Error;
      setErrorMessage(
        err.message ||
          `Une erreur est survenue lors de la ${
            isEditMode ? "modification" : "création"
          }.`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setName(userToEdit.name || "");
        setSmartphone(userToEdit.smartphone || "");
        setMail(userToEdit.mail || "");
        setSelectedImage(null);
        setImagePreview(userToEdit.photoURL || null);
        setPassword("");
        setConfirmPassword("");
      } else {
        resetForm();
      }
    }
  }, [isOpen, userToEdit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (isOpen || showSuccessModal)) {
        handleClose();
      }
    };

    if (isOpen || showSuccessModal || showUpdateSuccessModal) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, showSuccessModal, showUpdateSuccessModal]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (!isOpen && !showSuccessModal && !showUpdateSuccessModal) return null;

  return (
    <>
      {isOpen && !showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {isEditMode ? "Modifier l'agent" : "Nouvel Agent"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isEditMode
                      ? "Mettre à jour les informations de l'agent"
                      : "Créer un compte utilisateur (simple)"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                aria-label="Fermer la fenêtre"
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl leading-relaxed">
                {errorMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Photo de Profil
                </label>

                {imagePreview ? (
                  <div className="relative w-24 h-24 mx-auto group">
                    <img
                      src={imagePreview}
                      alt="Aperçu du profil"
                      className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-100 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      disabled={loading}
                      aria-label="Supprimer la photo"
                      className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="avatar-upload"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100/70 transition"
                  >
                    <div className="flex flex-col items-center justify-center pt-4 pb-4">
                      <ImagePlus className="w-5 h-5 text-slate-400 mb-1" />
                      <p className="text-xs text-slate-600 font-medium">
                        Cliquer pour importer une image
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        PNG, JPG, WEBP, etc. (Optimisation automatique)
                      </p>
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={loading}
                    />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom ou Pseudo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jean Tanjona"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro Téléphone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={smartphone}
                    onChange={(e) => setSmartphone(e.target.value)}
                    placeholder="034 16 475 84"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={mail}
                    onChange={(e) => setMail(e.target.value)}
                    placeholder="agent@natureau.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-600 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                        aria-label={
                          showPassword
                            ? "Masquer le mot de passe"
                            : "Afficher le mot de passe"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirmer le mot de passe
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        disabled={loading}
                        className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition ${
                          confirmPassword && confirmPassword !== password
                            ? "border-rose-300 focus:ring-rose-100 focus:border-rose-500"
                            : "border-slate-200 focus:ring-blue-100 focus:border-blue-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        disabled={loading}
                        aria-label={
                          showConfirmPassword
                            ? "Masquer la confirmation du mot de passe"
                            : "Afficher la confirmation du mot de passe"
                        }
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Traitement...
                    </>
                  ) : isEditMode ? (
                    "Enregistrer"
                  ) : (
                    "Créer l'agent"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && createdUserDetails && (
        <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Compte créé avec succès !
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Vous avez créé le compte de{" "}
                <span className="font-semibold text-slate-800">
                  {createdUserDetails.name}
                </span>{" "}
                avec l&apos;adresse email{" "}
                <span className="font-semibold text-slate-800">
                  {createdUserDetails.mail}
                </span>
                .
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-blue-500/20"
              >
                D&apos;accord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation pour la mise à jour d'un agent */}
      <UpdateModalConfirmation
        isOpen={showUpdateSuccessModal}
        onClose={handleClose}
        title="Modifications enregistrées !"
        message={`Les informations de ${name} ont été mises à jour avec succès.`}
      />
    </>
  );
}
