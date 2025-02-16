/*global dashboard*/
import React from 'react';
import PropTypes from 'prop-types';
import libraryParser from './libraryParser';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';
import {Heading2} from '@cdo/apps/lib/ui/Headings';
import Button from '@cdo/apps/templates/Button';

const styles = {
  alert: {
    color: color.red,
    width: '90%',
    paddingTop: 8
  },
  largerCheckbox: {
    width: 20,
    height: 20,
    marginLeft: 0,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 10
  },
  info: {
    fontSize: 12,
    fontStyle: 'italic'
  },
  textInput: {
    fontSize: 14,
    padding: 6,
    color: color.dimgray
  },
  description: {
    width: '98%',
    resize: 'vertical'
  },
  unpublishButton: {
    right: 0,
    marginTop: 20,
    position: 'absolute'
  }
};

/**
 * @readonly
 * @enum {string}
 */
export const PublishState = {
  DEFAULT: 'default',
  ERROR_PUBLISH: 'error_publish',
  INVALID_INPUT: 'invalid_input',
  ERROR_UNPUBLISH: 'error_unpublish'
};

/**
 * An interactive page for a dialog that can be used to publish or unpublish
 * a library from a source project.
 */
export default class LibraryPublisher extends React.Component {
  static propTypes = {
    onPublishSuccess: PropTypes.func.isRequired,
    onUnpublishSuccess: PropTypes.func.isRequired,
    libraryDetails: PropTypes.object.isRequired,
    libraryClientApi: PropTypes.object.isRequired
  };

  state = {
    publishState: PublishState.DEFAULT,
    libraryName: libraryParser.suggestName(
      this.props.libraryDetails.libraryName
    ),
    libraryDescription: this.props.libraryDetails.libraryDescription,
    selectedFunctions: this.props.libraryDetails.selectedFunctions
  };

  setLibraryName = event => {
    const {libraryName} = this.state;
    const sanitizedName = libraryParser.sanitizeName(event.target.value);
    if (sanitizedName === libraryName) {
      return;
    }
    this.setState({libraryName: sanitizedName});
  };

  publish = () => {
    const {libraryDescription, libraryName, selectedFunctions} = this.state;
    const {librarySource, sourceFunctionList} = this.props.libraryDetails;
    const {libraryClientApi, onPublishSuccess} = this.props;
    const functionsToPublish = sourceFunctionList.filter(sourceFunction => {
      return selectedFunctions[sourceFunction.functionName];
    });

    if (!(libraryDescription && functionsToPublish.length > 0)) {
      this.setState({publishState: PublishState.INVALID_INPUT});
      return;
    }

    const libraryJson = libraryParser.createLibraryJson(
      librarySource,
      functionsToPublish,
      libraryName,
      libraryDescription
    );

    libraryClientApi.publish(
      libraryJson,
      error => {
        console.warn(`Error publishing library: ${error}`);
        this.setState({publishState: PublishState.ERROR_PUBLISH});
      },
      () => {
        onPublishSuccess(libraryName);
      }
    );
    dashboard.project.setLibraryDetails(libraryName, libraryDescription);
  };

  displayNameInput = () => {
    const {libraryName} = this.state;
    return (
      <div>
        <input
          style={styles.textInput}
          type="text"
          value={libraryName}
          onChange={this.setLibraryName}
          onBlur={event =>
            this.setState({
              libraryName: libraryParser.suggestName(event.target.value)
            })
          }
        />
        <div style={styles.info}>{i18n.libraryNameRequirements()}</div>
      </div>
    );
  };

  resetErrorMessage = () => {
    const {libraryDescription, selectedFunctions, publishState} = this.state;
    if (
      libraryDescription &&
      Object.values(selectedFunctions).find(value => value) &&
      publishState === PublishState.INVALID_INPUT
    ) {
      this.setState({publishState: PublishState.DEFAULT});
    }
  };

  displayDescription = () => {
    const {libraryDescription} = this.state;
    return (
      <textarea
        rows="2"
        cols="200"
        style={{...styles.textInput, ...styles.description}}
        placeholder={i18n.libraryDescriptionPlaceholder()}
        value={libraryDescription}
        onChange={event => {
          this.setState(
            {libraryDescription: event.target.value},
            this.resetErrorMessage
          );
        }}
      />
    );
  };

  boxChecked = name => {
    this.setState(state => {
      state.selectedFunctions[name] = !state.selectedFunctions[name];
      return state;
    }, this.resetErrorMessage);
  };

  displayFunctions = () => {
    const {selectedFunctions} = this.state;
    const {sourceFunctionList} = this.props.libraryDetails;
    return sourceFunctionList.map(sourceFunction => {
      const {functionName, comment} = sourceFunction;
      const shouldDisable = comment.length === 0;
      let checked = selectedFunctions[functionName] || false;
      if (shouldDisable && checked) {
        checked = false;
        this.setState(state => {
          state.selectedFunctions[functionName] = false;
          return state;
        });
      }
      return (
        <div key={functionName}>
          <input
            style={styles.largerCheckbox}
            type="checkbox"
            disabled={shouldDisable}
            name={functionName}
            checked={checked}
            onChange={() => this.boxChecked(functionName)}
          />
          <span>{functionName}</span>
          <br />
          {shouldDisable && (
            <p style={styles.alert}>{i18n.libraryExportNoCommentError()}</p>
          )}
          <pre style={styles.textInput}>{comment}</pre>
        </div>
      );
    });
  };

  displayError = () => {
    const {publishState} = this.state;
    let errorMessage;
    switch (publishState) {
      case PublishState.INVALID_INPUT:
        errorMessage = i18n.libraryPublishInvalid();
        break;
      case PublishState.ERROR_PUBLISH:
        errorMessage = i18n.libraryPublishFail();
        break;
      case PublishState.ERROR_UNPUBLISH:
        errorMessage = i18n.libraryUnPublishFail();
        break;
      default:
        return;
    }
    return (
      <div>
        <p style={styles.alert}>{errorMessage}</p>
      </div>
    );
  };

  unpublish = () => {
    const {libraryClientApi, onUnpublishSuccess} = this.props;
    libraryClientApi.delete(
      () => {
        onUnpublishSuccess();
        dashboard.project.setLibraryDetails(undefined, undefined);
      },
      error => {
        console.warn(`Error publishing library: ${error}`);
        this.setState({publishState: PublishState.ERROR_UNPUBLISH});
      }
    );
  };

  render() {
    const {alreadyPublished} = this.props.libraryDetails;
    return (
      <div>
        <Heading2>{i18n.libraryName()}</Heading2>
        {this.displayNameInput()}
        <Heading2>{i18n.description()}</Heading2>
        {this.displayDescription()}
        <Heading2>{i18n.catProcedures()}</Heading2>
        {this.displayFunctions()}
        <div style={{position: 'relative'}}>
          <Button
            style={{marginTop: 20}}
            onClick={this.publish}
            text={alreadyPublished ? i18n.update() : i18n.publish()}
          />
          {alreadyPublished && (
            <Button
              style={styles.unpublishButton}
              onClick={this.unpublish}
              text={i18n.unpublish()}
              color={Button.ButtonColor.red}
            />
          )}
        </div>
        {this.displayError()}
      </div>
    );
  }
}
