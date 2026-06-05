import type { EleveRecitation, NiveauMemorisation } from '../../Types/coran';
import { NiveauMemorisation as NiveauMemorisationConst } from '../../Types/coran';
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
}

const inputStyle = {
  borderRadius: 8,
  border: '1px solid #e5e7eb',
  backgroundColor: '#f9fafb',
  fontSize: 13,
  padding: '6px 10px',
  boxShadow: 'none',
} as const;

const radioStyle = {
  width: 18,
  height: 18,
  cursor: 'pointer',
  accentColor: '#0A6E3F',
};

export default function EleveRecitationRow({
  eleve,
  recitation,
  onPresenceChange,
  onNiveauChange,
  onCommentaireChange,
}: EleveRecitationRowProps) {
  const present = recitation?.present ?? true;
  const niveauMemorisation = recitation?.niveauMemorisation ?? NiveauMemorisationConst.NON_MEMORISE;
  const commentaire = recitation?.commentaire ?? '';
  const groupeNiveau = recitation?.groupeNiveau ?? 'A';
  const isAbsent = !present;

  const handlePresenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPresenceChange(eleve.id, e.target.checked);
  };

  const handleNiveauChange = (niveau: NiveauMemorisation) => {
    onNiveauChange(eleve.id, niveau);
  };

  const handleCommentaireChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCommentaireChange(eleve.id, e.target.value);
  };

  return (
    <tr
      style={{
        backgroundColor: isAbsent ? '#f9fafb' : 'transparent',
        opacity: isAbsent ? 0.6 : 1,
      }}
    >
      {/* Checkbox présence */}
      <td className="py-3 px-3">
        <input
          type="checkbox"
          checked={present}
          onChange={handlePresenceChange}
          style={{
            width: 18,
            height: 18,
            cursor: 'pointer',
            accentColor: '#0A6E3F',
          }}
        />
      </td>

      {/* Informations élève */}
      <td className="py-3 px-3">
        <div className="d-flex flex-column">
          <span className="fw-semibold" style={{ fontSize: 13, color: '#111827' }}>
            {eleve.prenomArabe || eleve.prenom} {eleve.nomArabe || eleve.nom}
          </span>
          {(eleve.prenomArabe || eleve.nomArabe) && (
            <span className="text-muted" style={{ fontSize: 11 }}>
              {eleve.prenom} {eleve.nom}
            </span>
          )}
          {eleve.matricule && (
            <span
              className="badge rounded-pill fw-medium"
              style={{
                backgroundColor: '#f3f4f6',
                color: '#6b7280',
                fontSize: 10,
                fontFamily: 'monospace',
                padding: '2px 6px',
                marginTop: 4,
              }}
            >
              🆔 {eleve.matricule}
            </span>
          )}
        </div>
      </td>

      {/* Groupe niveau */}
      <td className="py-3 px-3">
        <span
          className="badge rounded-pill fw-medium"
          style={{
            backgroundColor: '#dbeafe',
            color: '#1d4ed8',
            fontSize: 11,
            padding: '4px 8px',
          }}
        >
          {groupeNiveau}
        </span>
      </td>

      {/* Niveau de mémorisation */}
      <td className="py-3 px-3">
        <div className="d-flex gap-2">
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name={`niveau-${eleve.id}`}
              checked={niveauMemorisation === NiveauMemorisationConst.MEMORISE}
              onChange={() => handleNiveauChange(NiveauMemorisationConst.MEMORISE)}
              disabled={isAbsent}
              style={radioStyle}
            />
            <span style={{ fontSize: 12, color: isAbsent ? '#9ca3af' : '#374151' }}>Mémorisé</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name={`niveau-${eleve.id}`}
              checked={niveauMemorisation === NiveauMemorisationConst.PARTIEL}
              onChange={() => handleNiveauChange(NiveauMemorisationConst.PARTIEL)}
              disabled={isAbsent}
              style={radioStyle}
            />
            <span style={{ fontSize: 12, color: isAbsent ? '#9ca3af' : '#374151' }}>Partiel</span>
          </label>
          <label className="d-flex align-items-center gap-1" style={{ cursor: 'pointer' }}>
            <input
              type="radio"
              name={`niveau-${eleve.id}`}
              checked={niveauMemorisation === NiveauMemorisationConst.NON_MEMORISE}
              onChange={() => handleNiveauChange(NiveauMemorisationConst.NON_MEMORISE)}
              disabled={isAbsent}
              style={radioStyle}
            />
            <span style={{ fontSize: 12, color: isAbsent ? '#9ca3af' : '#374151' }}>Non</span>
          </label>
        </div>
      </td>

      {/* Badge du niveau */}
      <td className="py-3 px-3">
        <NiveauBadge niveau={niveauMemorisation} />
      </td>

      {/* Commentaire */}
      <td className="py-3 px-3">
        <input
          type="text"
          value={commentaire}
          onChange={handleCommentaireChange}
          placeholder="Commentaire..."
          disabled={isAbsent}
          className="form-control"
          style={{
            ...inputStyle,
            opacity: isAbsent ? 0.5 : 1,
          }}
        />
      </td>
    </tr>
  );
}
