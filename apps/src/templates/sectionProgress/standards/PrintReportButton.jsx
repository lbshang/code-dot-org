import React, {Component} from 'react';
import i18n from '@cdo/locale';
import Button from '../../Button';
import PropTypes from 'prop-types';

const styles = {
  button: {
    margin: '20px 0px'
  }
};

export default class PrintReportButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <Button
          onClick={this.props.onClick}
          color={Button.ButtonColor.orange}
          text={i18n.printReport()}
          size={'narrow'}
          style={styles.button}
        />
      </div>
    );
  }
}
