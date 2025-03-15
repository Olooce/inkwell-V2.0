import bcrypt from "bcryptjs";

const hash256encode = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const createAuthPayload = async (email, password) => {
  const hashedPassword = await hash256encode(password);
  const concatenatedString = `${email}::${hashedPassword}`;

  // Generate bcrypt hash
  const bcryptEncrypted = bcrypt.hashSync(concatenatedString, bcrypt.genSaltSync(10));

  console.log(bcryptEncrypted);

  // Base64 encode bcrypt hash (only after hashing)
  const authhash = btoa(bcryptEncrypted);

  return {
    email,
    authhash, // Base64 encoded bcrypt hash
  };

};
