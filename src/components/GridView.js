/* @flow */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
  Animated,
  StyleSheet,
  VirtualizedList,
  ViewPropTypes,
} from 'react-native';
import withTheme from '../core/withTheme';
import type { Theme } from '../types/Theme';

type Props = {
  /**
   * Item's spacing
   */
  spacing: number,
  /**
   * Function which determine number of columns.
   */
  getNumberOfColumns: (width: number) => number,
  /**
   * Data for the list
   */
  data: Array<any>,
  /**
   * Function which should return ID base on the item.
   */
  keyExtractor: (item: any) => string,
  contentContainerStyle: ?Object,
  /**
   * Component for rendering item
   */
  renderItem: (item: any) => React$Element<*>,
  onLayout?: Function,
  theme: Theme,
};

type DefaultProps = {
  getNumberOfColumns: (width: number) => number,
  spacing: number,
};

type State = {
  itemWidth: Animated.Value,
};

class GridView extends PureComponent<DefaultProps, Props, State> {
  static propTypes = {
    data: PropTypes.array.isRequired,
    spacing: PropTypes.number.isRequired,
    getNumberOfColumns: PropTypes.func.isRequired,
    renderItem: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func.isRequired,
    onLayout: PropTypes.func,
    theme: PropTypes.object.isRequired,
    contentContainerStyle: ViewPropTypes.style,
  };

  static defaultProps = {
    getNumberOfColumns: () => 1,
    spacing: 0,
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      itemWidth: new Animated.Value(0),
    };
  }

  state: State;

  _root: VirtualizedList;

  scrollToIndex = (params: Object) => this._root.scrollToIndex(params);
  scrollToItem = (params: Object) => this._root.scrollToItem(params);
  scrollToEnd = (params?: Object) => this._root.scrollToEnd(params);
  scrollToOffset = (params: Object) => this._root.scrollToOffset(params);

  _renderItem = ({ item }) => {
    const { spacing, renderItem } = this.props;

    const style = {
      width: this.state.itemWidth,
      margin: spacing / 2,
    };

    return <Animated.View style={style}>{renderItem(item)}</Animated.View>;
  };

  _handleLayout = (e: any) => {
    const { getNumberOfColumns, spacing } = this.props;

    if (this.props.onLayout) {
      this.props.onLayout(e);
    }

    const layoutWidth = e.nativeEvent.layout.width;

    this.state.itemWidth.setValue(
      (layoutWidth - spacing) / getNumberOfColumns(layoutWidth) - spacing
    );
  };

  _getItemCount = (data: Array<any>) => data.length;

  _getItem = (data, index) => data[index];

  render() {
    const { spacing, theme, data, keyExtractor } = this.props;
    return (
      <VirtualizedList
        {...this.props}
        data={data}
        getItemCount={this._getItemCount}
        getItem={this._getItem}
        onLayout={this._handleLayout}
        renderItem={this._renderItem}
        keyExtractor={keyExtractor}
        ref={c => (this._root = c)}
        contentContainerStyle={[
          styles.grid,
          { padding: spacing / 2, backgroundColor: theme.colors.background },
          this.props.contentContainerStyle,
        ]}
      />
    );
  }
}

const styles = StyleSheet.create({
  grid: {
    flexWrap: 'wrap', // Warning is misleading https://github.com/facebook/react-native/issues/15772
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

export default withTheme(GridView);
