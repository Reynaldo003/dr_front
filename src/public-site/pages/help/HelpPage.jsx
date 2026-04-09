// src/pages/help/HelpPage.jsx

export default function HelpPage({ title, lead, children }) {
  return (
    
    <main className="mx-auto max-w-6xl px-5 sm:px-6 py-14 md:py-20">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
        {title}
      </h1>

      {lead ? (
        <p className="mt-6 text-base md:text-lg text-gray-600 max-w-3xl">
          {lead}
        </p>
      ) : null}

      <div className="mt-12 space-y-10">{children}</div>
    </main>
  );
}
