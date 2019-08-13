import React, {
    useState, useEffect, useContext, useRef,
} from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';

import FloatingIconButton from '../../nlu/common/FloatingIconButton';
import UserUtteranceViewer from '../../utils/UserUtteranceViewer';
import { ConversationOptionsContext } from '../../utils/Context';
import UtteranceInput from '../../utils/UtteranceInput';

const UtteranceContainer = (props) => {
    const {
        value, onInput, onDelete, onAbort, onChange, deletable, exceptions,
    } = props;
    const [mode, setMode] = useState(!value ? 'input' : 'view');
    const { parseUtterance, getUtteranceFromPayload } = useContext(ConversationOptionsContext);
    const [stateValue, setStateValue] = useState(value);
    const [input, setInput] = useState();
    const [parsed, setParsed] = useState(false);
    const [fetchedData, setFetchedData] = useState(value || null);
    const containerBody = useRef();

    useEffect(() => {
        setMode(!value ? 'input' : 'view');
        if (value) {
            getUtteranceFromPayload(value, (err, data) => {
                if (!err) setFetchedData(data);
            });
        }
    }, [value]);

    const validateInput = async () => {
        try {
            const { intent, entities, text } = await parseUtterance(input);
            setStateValue({ entities, text, intent: intent.name || '-' });
            setParsed(true);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(e);
            setStateValue({ text: input, intent: '-' });
            setParsed(true);
        }
    };

    const saveInput = () => {
        onInput(stateValue);
    };

    const handleClickOutside = (event) => {
        if (
            containerBody.current
            && parsed
            && !containerBody.current.contains(event.target)
            && !event.target.className.split(' ').includes('trash')
        ) saveInput();
    };

    useEffect(() => {
        if (parsed) document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside); // will unmount
        };
    }, [parsed]);

    const render = () => {
        if (mode === 'input') {
            if (!stateValue) {
                return (
                    <UtteranceInput
                        placeholder='User says...'
                        fluid
                        value={input}
                        onChange={u => setInput(u)}
                        onValidate={() => validateInput()}
                        onDelete={() => onAbort()}
                    />
                );
            }
            return (
                <>
                    <UserUtteranceViewer
                        value={stateValue}
                        size='mini'
                        onChange={setStateValue}
                    />
                    <Button primary onClick={saveInput} content='Save' size='mini' data-cy='save-new-user-input' />
                </>
            );
        }
        return (
            <UserUtteranceViewer
                value={fetchedData || value}
                disableEditing
                size='mini'
                // onChange={v => onChange(v)}
            />
        );
    };

    return (
        <div
            className='utterance-container'
            exception={exceptions.severity}
            mode={mode}
            agent='user'
            ref={containerBody}
        >
            <div className='inner'>{render()}</div>
            {deletable && (
                <FloatingIconButton
                    icon='trash'
                    onClick={() => {
                        if (mode === 'input') return onAbort();
                        return onDelete();
                    }}
                />
            )}
        </div>
    );
};

UtteranceContainer.propTypes = {
    deletable: PropTypes.bool,
    value: PropTypes.object,
    onInput: PropTypes.func.isRequired,
    // onChange: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onAbort: PropTypes.func.isRequired,
    exceptions: PropTypes.object,
};

UtteranceContainer.defaultProps = {
    value: null,
    deletable: true,
    exceptions: { severity: null, messages: [] },
};

export default UtteranceContainer;
