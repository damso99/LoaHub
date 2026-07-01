import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';

export const CharacterCard = ({ character, onSetMain }) => {
  return (
    <Card className="character-card">
      <div className="character-card__header">
        <div className="character-card__icon">
          <img src={character.characterImage} alt={character.characterName} />
        </div>
        <div>
          <div className="character-card__title-row">
            <h3>{character.characterName}</h3>
            {character.isMain ? <Badge tone="warning">대표</Badge> : null}
          </div>
          <p>{character.serverName}</p>
        </div>
      </div>

      <div className="character-card__stats">
        <div>
          <span>직업</span>
          <strong>{character.characterClass}</strong>
        </div>
        <div>
          <span>아이템 레벨</span>
          <strong>{character.itemLevel}</strong>
        </div>
      </div>

      <div className="character-card__actions">
        <Button variant={character.isMain ? 'ghost' : 'secondary'} onClick={() => onSetMain?.(character)}>
          {character.isMain ? '대표 캐릭터' : '대표 캐릭터로 설정'}
        </Button>
      </div>
    </Card>
  );
};
