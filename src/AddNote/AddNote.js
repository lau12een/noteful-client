import React, { Component } from 'react'
import NoteForm from '../NoteForm/NoteForm'
import ApiContext from '../ApiContext'
import ValidationError from '../ValidationError';
import Config from '../Config'
import PropTypes from 'prop-types';


export default class AddNote extends Component {
  static contextType = ApiContext;

  constructor(props) {
      super(props);
      this.state = {
          noteName: "",
          noteContent: "",
          noteNameValid: false,
          formValid: false,
            validationMessages: {
                incorrectName: '',
             }
      }
  }

  updateNoteName(noteName) {
      this.setState({noteName}, () => {this.validateNoteName(noteName)})
  }

  validateNoteName(fieldValue) {
    const fieldErrors = {...this.state.validationMessages};
    let hasError = false;

    fieldValue = fieldValue.trim();
    if(fieldValue.length === 0) {
      fieldErrors.incorrectName = 'Name is required';
      hasError = true;
    } else {
      if (fieldValue.length < 3) {
        fieldErrors.incorrectName = 'Name must be at least 3 characters long';
        hasError = true;
      } else {
        fieldErrors.incorrectName = '';
        hasError = false;
      }
    }

    this.setState({
      validationMessages: fieldErrors,
      nameValid: !hasError
    }, this.formValid );

}

formValid() {
    this.setState({
      formValid: this.state.noteNameValid 
    });
  }

  handleSubmit = e => {
    e.preventDefault()
    const newNote = {
      name: e.target['noteName'].value,
      content: e.target['noteContent'].value,
      folderId: e.target['note-folder-id'].value,
      modified: new Date(),
    }
    fetch(`${Config.API_ENDPOINT}/notes`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(newNote),
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(e => Promise.reject(e))
        return res.json()
      })
      .then(note => {
        this.context.addNote(note)
        this.props.history.push(`/folder/${note.folderId}`)
      })
      .catch(error => {
        console.error({ error })
      })
  }

  render() {
    const { folders=[] } = this.context
    return (
      <section className='AddNote'>

        <h2>Create a note</h2>

        <NoteForm onSubmit={this.handleSubmit}>
          <div className='field'>
            <label htmlFor='note-name-input'>
              Name
            </label>
            <input type='text' id='note-name-input' name='noteName' onChange={e => this.updateNoteName(e.target.value)}/>
            <ValidationError hasError={!this.state.noteNameValid} message={this.state.validationMessages.incorrectName}/>
          </div>
          <div className='field'>
            <label htmlFor='note-content-input'>
              Content
            </label>
            <textarea id='note-content-input' name='noteContent'/>
          </div>
          <div className='field'>
            <label htmlFor='note-folder-select'>
              Folder
            </label>
            <select id='note-folder-select' name='note-folder-id'>
              <option value={null}>...</option>
              {folders.map(folder =>
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              )}
            </select>
          </div>
          <div className='buttons'>
            <button type='submit'>
              Add note
            </button>
          </div>
        </NoteForm>
      </section>
    )
  }
}

AddNote.defaultProps = {
    history: PropTypes.Object,
  }