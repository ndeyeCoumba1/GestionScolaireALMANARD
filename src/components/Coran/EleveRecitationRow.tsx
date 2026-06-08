import type { EleveRecitation, NiveauMemorisation } from '../../Types/coran';
import { NiveauMemorisation as NiveauMemorisationConst } from '../../Types/coran';
import { SOURATES } from '../../services/coranService';
import NiveauBadge from './NiveauBadge';

interface EleveRecitationRowProps {
  eleve: {
    id: number;
    nom: string;
    prenom: string;
    nomArabe?: string;
    prenomArabe?: string;
    matricule?: string;
  };
  recitation?: EleveRecitation;
  onPresenceChange: (eleveId: number, present: boolean) => void;
  onNiveauChange: (eleveId: number, niveau: NiveauMemorisation) => void;
  onCommentaireChange: (eleveId: number, commentaire: string) => void;
  onVersetChange: (eleveId: number, sourateNumero: number, versetDebut: number, versetFin: number) => void;
}

const inputStyle = {
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: 12,
  padding: '4px 8px',
  boxShadow: 'none',
} as const;

const radioStyle = { width: 16, height: 16, cursor: 'pointer', accentColor: '#0A6E3F' };

export default function EleveRecitationRow({
  eleve,
  recitation,
  onPresenceChange,
  onNiveauChange,
  onCommentaireChange,
  onVersetChange,
}: EleveRecitationRowProps) {
  const present = recitation?.present ?? true;
  const niveauMemorisation = recitation?.niveauMemorisation ?? NiveauMemorisationConst.NON_MEMORISE;
  const commentaire = recitation?.commentaire ?? '';
  const sourateNumero = recitation?.sourateNumero ?? 1;
  const versetDebut = recitation?.versetDebut ?? 1;
  const versetFin = recitation?.versetFin ?? 7;
  const isAbsent = !present;

  const sourateSelectionnee = SOURATES.find((s) => s.numero === sourateNumero);
  const maxVersets = sourateSelectionnee?.nombreVersets ?? 286;

  const handleSourateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const num = Number(e.target.value);
    const s = SOURATES.find((s) => s.numero === num);
    onVersetChange(eleve.id, num, 1, s?.nombreVersets ?? 7);
  };

  const handleVersetDebutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.min(Number(e.target.value), versetFin));
    onVersetChange(eleve.id, sourateNumero, v, versetFin);
  };

  const handleVersetFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(versetDebut, Math.min(Number(e.target.value), maxVersets));
    onVersetChange(eleve.id, sourateNumero, versetDebut, v);
  };

  return (
    <tr style={{ backgroundColor: isAbsent ? '#f9fafb' : 'transparent', opacity: isAbsent ? 0.6 : 1 }}>

      {/* Checkbox présence */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
        <input
          type="checkbox"
          checked={present}
          onChange={(e) => onPresenceChange(eleve.id, e.target.checked)}
          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0A6E3F' }}
        />
      </td>

      {/* Nom élève */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
        <div className="d-flex flex-column">
          <span className="fw-semibold" style={{ fontSize: 13, color: '#111827' }}>
            {eleve.prenomArabe || eleve.prenom} {eleve.nomArabe || eleve.nom}
          </span>
          {(eleve.prenomArabe || eleve.nomArabe) && (
            <span className="text-muted" style={{ fontSize: 11 }}>{eleve.prenom} {eleve.nom}</span>
          )}
          {eleve.matricule && (
            <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace', padding: '2px 6px', marginTop: 4 }}>
              🆔 {eleve.matricule}
            </span>
          )}
        </div>
      </td>

      {/* Sourate + Versets (individuel) */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle', minWidth: 280 }}>
        <div className="d-flex flex-column gap-1">
          <select
            value={sourateNumero}
            onChange={handleSourateChange}
            disabled={isAbsent}
            className="form-select"
            style={{ ...inputStyle, fontSize: 12 }}
          >
            {SOURATES.map((s) => (
              <option key={s.numero} value={s.numero}>
                {s.nomArabe} — {s.nomFrancais}
              </option>
            ))}
          </select>
          <div className="d-flex align-items-center gap-1">
            <span style={{ fontSize: 11, color: '#6b7280', whiteSpace: 'nowrap' }}>V.</span>
            <input
              type="number"
              min={1}
              max={versetFin}
              value={versetDebut}
              onChange={handleVersetDebutChange}
              disabled={isAbsent}
              className="form-control text-center"
              style={{ ...inputStyle, width: 60 }}
              title="Verset début"
            />
            <span style={{ fontSize: 11, color: '#6b7280' }}>→</span>
            <input
              type="number"
              min={versetDebut}
              max={maxVersets}
              value={versetFin}
              onChange={handleVersetFinChange}
              disabled={isAbsent}
              className="form-control text-center"
              style={{ ...inputStyle, width: 60 }}
              title="Verset fin"
            />
            <span style={{ fontSize: 10, color: '#9ca3af' }}>/{maxVersets}</span>
          </div>
        </div>
      </td>

      {/* Niveau mémorisation */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
        <div className="d-flex flex-column gap-1">
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.MEMORISE} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.MEMORISE)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 12 }}>Mémorisé</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.PARTIEL} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.PARTIEL)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 12 }}>Partiel</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.NON_MEMORISE} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.NON_MEMORISE)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 12 }}>Non mémorisé</span>
          </label>
        </div>
      </td>

      {/* Badge statut */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
        <NiveauBadge niveau={niveauMemorisation} />
      </td>

      {/* Commentaire */}
      <td className="py-2 px-3" style={{ verticalAlign: 'middle' }}>
        <input
          type="text"
          value={commentaire}
          onChange={(e) => onCommentaireChange(eleve.id, e.target.value)}
          placeholder="Remarques..."
          disabled={isAbsent}
          className="form-control"
          style={{ ...inputStyle, opacity: isAbsent ? 0.5 : 1 }}
        />
      </td>
    </tr>
  );
}
