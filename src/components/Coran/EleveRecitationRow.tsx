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
  classeName?: string;
  recitateur?: string;
  enseignant?: string;
  hasError?: boolean;
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

const radioStyle = { width: 15, height: 15, cursor: 'pointer', accentColor: '#0A6E3F' };

export default function EleveRecitationRow({
  eleve,
  recitation,
  classeName,
  recitateur,
  enseignant,
  hasError,
  onPresenceChange,
  onNiveauChange,
  onCommentaireChange,
  onVersetChange,
}: EleveRecitationRowProps) {
  const present = recitation?.present ?? true;
  const niveauMemorisation = recitation?.niveauMemorisation ?? NiveauMemorisationConst.NON_MEMORISE;
  const commentaire = recitation?.commentaire ?? '';
  const sourateNumero = recitation?.sourateNumero ?? 1;
  const versetDebut = recitation?.versetDebut ?? 0;
  const versetFin = recitation?.versetFin ?? 0;
  const isAbsent = !present;

  const sourateSelectionnee = SOURATES.find((s) => s.numero === sourateNumero);
  const maxVersets = sourateSelectionnee?.nombreVersets ?? 286;

  const handleSourateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVersetChange(eleve.id, Number(e.target.value), 0, 0);
  };

  const handleVersetDebutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.min(Number(e.target.value), versetFin));
    onVersetChange(eleve.id, sourateNumero, v, versetFin);
  };

  const handleVersetFinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(versetDebut, Math.min(Number(e.target.value), maxVersets));
    onVersetChange(eleve.id, sourateNumero, versetDebut, v);
  };

  const errorBg = hasError && !isAbsent ? '#fff5f5' : isAbsent ? '#f9fafb' : 'transparent';
  const versetInputStyle = (val: number) => ({
    ...inputStyle,
    width: 64,
    border: hasError && !isAbsent && (!val || val <= 0) ? '2px solid #dc2626' : inputStyle.border,
    backgroundColor: hasError && !isAbsent && (!val || val <= 0) ? '#fff1f1' : inputStyle.backgroundColor,
  });

  return (
    <tr style={{ backgroundColor: errorBg, opacity: isAbsent ? 0.65 : 1 }}>

      {/* 1. Présence */}
      <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
        <input
          type="checkbox"
          checked={present}
          onChange={(e) => onPresenceChange(eleve.id, e.target.checked)}
          style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#0A6E3F' }}
        />
      </td>

      {/* 2. Prénom */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 13, color: '#111827' }}>{eleve.prenom}</span>
      </td>

      {/* 3. Nom */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <span className="fw-semibold" style={{ fontSize: 13, color: '#111827' }}>{eleve.nom}</span>
      </td>

      {/* 4. Matricule */}
      <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
        {eleve.matricule ? (
          <span className="badge rounded-pill fw-medium" style={{ backgroundColor: '#f3f4f6', color: '#6b7280', fontSize: 10, fontFamily: 'monospace' }}>
            {eleve.matricule}
          </span>
        ) : <span className="text-muted" style={{ fontSize: 11 }}>—</span>}
      </td>

      {/* 5. الاسم (Prénom arabe) */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', textAlign: 'right', direction: 'rtl' }}>
        <span style={{ fontSize: 13, color: '#374151', fontFamily: 'serif' }}>
          {eleve.prenomArabe || '—'}
        </span>
      </td>

      {/* 6. اللقب (Nom arabe) */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', textAlign: 'right', direction: 'rtl' }}>
        <span className="fw-semibold" style={{ fontSize: 13, color: '#374151', fontFamily: 'serif' }}>
          {eleve.nomArabe || '—'}
        </span>
      </td>

      {/* 7. Classe */}
      <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
        <span className="badge" style={{ backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 6 }}>
          {classeName || '—'}
        </span>
      </td>

      {/* 8. Sourate */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', minWidth: 170 }}>
        <select
          value={sourateNumero}
          onChange={handleSourateChange}
          disabled={isAbsent}
          className="form-select"
          style={{ ...inputStyle, fontSize: 11 }}
        >
          {SOURATES.map((s) => (
            <option key={s.numero} value={s.numero}>
              {s.numero}. {s.nomArabe} — {s.nomFrancais}
            </option>
          ))}
        </select>
      </td>

      {/* 9. Verset début */}
      <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
        <input
          type="number"
          min={1}
          max={versetFin}
          value={versetDebut}
          onChange={handleVersetDebutChange}
          disabled={isAbsent}
          className="form-control text-center"
          style={versetInputStyle(versetDebut)}
          title="Verset début (obligatoire)"
        />
        {hasError && !isAbsent && (!versetDebut || versetDebut <= 0) && (
          <span style={{ fontSize: 9, color: '#dc2626', display: 'block' }}>Obligatoire</span>
        )}
      </td>

      {/* 10. Verset fin */}
      <td className="py-2 px-2 text-center" style={{ verticalAlign: 'middle' }}>
        <input
          type="number"
          min={versetDebut}
          max={maxVersets}
          value={versetFin}
          onChange={handleVersetFinChange}
          disabled={isAbsent}
          className="form-control text-center"
          style={versetInputStyle(versetFin)}
          title="Verset fin (obligatoire)"
        />
        <span style={{ fontSize: 10, color: '#9ca3af', display: 'block' }}>/{maxVersets}</span>
        {hasError && !isAbsent && (!versetFin || versetFin <= 0) && (
          <span style={{ fontSize: 9, color: '#dc2626', display: 'block' }}>Obligatoire</span>
        )}
      </td>

      {/* 11. Mémorisation */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle' }}>
        <div className="d-flex flex-column gap-1">
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer', margin: 0 }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.MEMORISE} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.MEMORISE)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 11 }}>Mémorisé</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer', margin: 0 }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.PARTIEL} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.PARTIEL)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 11 }}>Partiel</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer', margin: 0 }}>
            <input type="radio" name={`niveau-${eleve.id}`} checked={niveauMemorisation === NiveauMemorisationConst.NON_MEMORISE} onChange={() => onNiveauChange(eleve.id, NiveauMemorisationConst.NON_MEMORISE)} disabled={isAbsent} style={radioStyle} />
            <span style={{ fontSize: 11 }}>Non mémorisé</span>
          </label>
        </div>
      </td>

      {/* 12. Statut */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle' }}>
        <NiveauBadge niveau={niveauMemorisation} />
      </td>

      {/* 13. Récitateur */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <div className="d-flex align-items-center gap-1">
          <span style={{ fontSize: 14 }}>🎧</span>
          <span style={{ fontSize: 12, color: '#0A6E3F', fontWeight: 600 }}>
            {recitateur || '—'}
          </span>
        </div>
      </td>

      {/* 14. Enseignant */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
        <div className="d-flex align-items-center gap-1">
          <span style={{ fontSize: 14 }}>👨‍🏫</span>
          <span style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
            {enseignant || '—'}
          </span>
        </div>
      </td>

      {/* 15. Remarques */}
      <td className="py-2 px-2" style={{ verticalAlign: 'middle' }}>
        <input
          type="text"
          value={commentaire}
          onChange={(e) => onCommentaireChange(eleve.id, e.target.value)}
          placeholder="Remarques..."
          disabled={isAbsent}
          className="form-control"
          style={{ ...inputStyle, minWidth: 120, opacity: isAbsent ? 0.5 : 1 }}
        />
      </td>
    </tr>
  );
}
