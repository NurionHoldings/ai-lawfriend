export function buildDocumentVerificationUrl(input: {
  baseUrl?: string | null;
  verificationCode: string;
}) {
  const baseUrl = (input.baseUrl ?? "").replace(/\/$/, "");
  const encodedCode = encodeURIComponent(input.verificationCode);

  if (!baseUrl) {
    return `/document-verification?code=${encodedCode}`;
  }

  return `${baseUrl}/document-verification?code=${encodedCode}`;
}
