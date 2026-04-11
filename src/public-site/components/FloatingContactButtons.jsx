// src/public-site/components/FloatingContactButtons.jsx
export default function FloatingContactButtons() {
  const instagramUrl = "https://www.instagram.com/misdosreynas/";
  const whatsappUrl =
    "https://wa.me/522712080728?text=Hola,%20quiero%20informaci%C3%B3n%20sobre%20Mis%20Dos%20Reynas";

  return (
    <div className="fixed right-4 bottom-5 z-[70] flex flex-col gap-3 sm:right-6 sm:bottom-6">
      {/* Instagram */}
      <a
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-12 sm:w-12"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-6 w-6 fill-black transition group-hover:scale-110 sm:h-7 sm:w-7"
        >
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5Zm8.88 1.12a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5A3.5 3.5 0 1 0 12 15.5 3.5 3.5 0 0 0 12 8.5Z" />
        </svg>
      </a>

      {/* WhatsApp */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="group flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:h-12 sm:w-12"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-black transition group-hover:scale-110 sm:h-6 sm:w-6"
        >
          <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.52 0 .18 5.34.18 11.88c0 2.1.54 4.14 1.62 5.94L0 24l6.36-1.74a11.92 11.92 0 0 0 5.7 1.44h.06c6.54 0 11.88-5.34 11.88-11.88 0-3.18-1.26-6.18-3.48-8.34ZM12.12 21.66h-.06a9.9 9.9 0 0 1-5.04-1.38l-.36-.18-3.78 1.02 1.02-3.66-.24-.36a9.8 9.8 0 0 1-1.5-5.22c0-5.46 4.44-9.9 9.9-9.9 2.64 0 5.1 1.02 6.96 2.88a9.78 9.78 0 0 1 2.88 6.96c0 5.46-4.44 9.9-9.78 9.84Zm5.46-7.38c-.3-.18-1.8-.9-2.1-1.02-.24-.12-.42-.18-.6.18-.18.3-.72 1.02-.9 1.2-.12.18-.3.24-.54.06-.3-.18-1.2-.42-2.28-1.38-.84-.72-1.38-1.62-1.56-1.92-.18-.3 0-.42.12-.6.12-.12.3-.3.42-.48.12-.18.18-.3.3-.48.12-.24.06-.42 0-.6-.06-.18-.6-1.5-.84-2.04-.18-.54-.42-.48-.6-.48h-.54c-.18 0-.48.06-.72.3-.24.3-.96.96-.96 2.28 0 1.32.96 2.64 1.08 2.82.18.18 1.92 3 4.74 4.14.66.3 1.2.48 1.62.6.66.18 1.26.18 1.74.12.54-.06 1.8-.72 2.04-1.44.3-.66.3-1.32.18-1.44-.06-.18-.24-.24-.54-.42Z" />
        </svg>
      </a>
    </div>
  );
}