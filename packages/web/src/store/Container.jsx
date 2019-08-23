import React, { Component } from "react";
import PropTypes from "prop-types";
import { ReactReduxContext } from "react-redux";

export default function(reducer, actions, key, extend) {
  return function(BaseComponent) {
    class Container extends Component {
      static propTypes = {
        store: PropTypes.object.isRequired
      };
      componentWillMount() {
        console.log(key, reducer);
        this.props.store.manager.add(key, reducer);
      }
      componentWillUnmount() {
        this.props.store.manager.remove(key, reducer);
      }
      render() {
        console.log(this.props.store);
        return <BaseComponent />;
      }
    }

    function StoreConnector() {
      return (
        <ReactReduxContext.Consumer>
          {({ store }) => <Container store={store} />}
        </ReactReduxContext.Consumer>
      );
    }
    return StoreConnector;
  };
}
