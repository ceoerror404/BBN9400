/**
 * Draaiend ringetje in een knop die even wacht ("Even geduld…"). Erft de tekstkleur.
 * Wie minder beweging vraagt, krijgt het niet te zien: de tekst van de knop zegt al wat er gebeurt.
 */
export function Spinner({ className = "" }: { className?: string }) {
  return <span aria-hidden="true" className={`size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:hidden ${className}`} />;
}
