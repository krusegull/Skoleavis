import { SubmissionForm } from "@/components/submissions/SubmissionForm";

export default function SendInnPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="rule-thick border-ink pb-2 font-headline text-4xl font-bold text-ink">
        Send inn til redaksjonen
      </h1>
      <p className="mt-4 font-serif text-ink/80">
        Har du skrevet en sak, en tekst eller en melding du vil dele med Stuanytt? Last opp
        dokumentet ditt (Word, PDF e.l.) her, gjerne sammen med bilder. Redaksjonen leser
        gjennom alt som sendes inn, og tar kontakt hvis saken skal bli en sak i avisen.
      </p>
      <div className="mt-8">
        <SubmissionForm />
      </div>
    </div>
  );
}
