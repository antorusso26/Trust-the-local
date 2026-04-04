interface DisclaimerProps {
  operatorName: string;
}

/**
 * Legal disclaimer - NOT editable by users.
 * Required for compliance: platform acts as tech provider only.
 */
export function Disclaimer({ operatorName }: DisclaimerProps) {
  return (
    <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 leading-relaxed">
      <p>
        La piattaforma <strong>Trust the Local</strong> agisce esclusivamente come
        fornitore tecnologico. Il servizio turistico è erogato da{" "}
        <strong>{operatorName}</strong>, unico responsabile dell&apos;erogazione del
        servizio, delle condizioni di vendita e della gestione di eventuali
        reclami.
      </p>
      <p className="mt-1">
        Per modifiche o rimborsi, contattare direttamente l&apos;operatore.
      </p>
    </div>
  );
}
