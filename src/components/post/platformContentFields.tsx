import { FormField, Input, Textarea } from "@/components/ui";

const TITLE_MAX_LENGTH = 280;
const DESCRIPTION_MAX_LENGTH = 4000;
const COUNTER_WARNING_RATIO = 0.9;

type CounterState = "normal" | "warning" | "limit";

function getCounterState(length: number, maxLength: number): CounterState {
  if (length >= maxLength) {
    return "limit";
  }

  if (length >= Math.floor(maxLength * COUNTER_WARNING_RATIO)) {
    return "warning";
  }

  return "normal";
}

function getCounterMessage(length: number, maxLength: number, state: CounterState): string {
  if (state === "limit") {
    return `Limite atteinte: ${length}/${maxLength} caracteres`;
  }

  if (state === "warning") {
    return `Proche de la limite: ${length}/${maxLength} caracteres`;
  }

  return `${length}/${maxLength} caracteres`;
}

type PlatformContentFieldsProps = {
  platformKey: string;
  platformLabel: string;
  titleValue: string;
  descriptionValue: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
};

export function PlatformContentFields({
  platformKey,
  platformLabel,
  titleValue,
  descriptionValue,
  onTitleChange,
  onDescriptionChange,
}: PlatformContentFieldsProps) {
  const titleFieldId = `target-title-${platformKey.toLowerCase()}`;
  const descriptionFieldId = `target-description-${platformKey.toLowerCase()}`;

  const titleCounterState = getCounterState(titleValue.length, TITLE_MAX_LENGTH);
  const descriptionCounterState = getCounterState(
    descriptionValue.length,
    DESCRIPTION_MAX_LENGTH,
  );

  const titleHintClassName = `counter-hint counter-${titleCounterState}`;
  const descriptionHintClassName = `counter-hint counter-${descriptionCounterState}`;

  return (
    <div className="platform-override">
      <h3>{platformLabel}</h3>

      <FormField
        label="Titre"
        htmlFor={titleFieldId}
        hint={getCounterMessage(titleValue.length, TITLE_MAX_LENGTH, titleCounterState)}
        hintClassName={titleHintClassName}
      >
        <Input
          id={titleFieldId}
          value={titleValue}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={`Titre pour ${platformLabel}`}
          maxLength={TITLE_MAX_LENGTH}
          required
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor={descriptionFieldId}
        hint={getCounterMessage(
          descriptionValue.length,
          DESCRIPTION_MAX_LENGTH,
          descriptionCounterState,
        )}
        hintClassName={descriptionHintClassName}
      >
        <Textarea
          id={descriptionFieldId}
          value={descriptionValue}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={`Description pour ${platformLabel}`}
          maxLength={DESCRIPTION_MAX_LENGTH}
          required
        />
      </FormField>
    </div>
  );
}
