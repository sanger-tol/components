import { useState } from 'react';
import { InlineEdit } from 'rsuite';

interface Props {
  title: string; 
  onSave?: (value: string) => void; 
  onChange?: (value: string) => void; 
}

const EditableTitle: React.FC<Props> = ({ title, onSave, onChange }) => {
  const [editedTitle, setEditedTitle] = useState(title);

  return (
    <InlineEdit
      value={editedTitle}
      onChange={(newValue) => {
        setEditedTitle(newValue);
        onChange?.(newValue);
      }}
      onSave={() => onSave?.(editedTitle)}
      showControls={false} >
      {(props, ref) => {
        const { value, plaintext, ...rest } = props;

        return plaintext ? (
          <span className="title-read-mode"> {value}</span>
        ) : (
          <input
            {...rest}
            ref={ref}
            value={value}
            onChange={(e) => setEditedTitle(e.target.value)}
            className={"title-edit-mode"}
          />
        );
      }}
    </InlineEdit>
  );
};

export default EditableTitle;
