import { StyleSheet } from 'react-native';
import { colors, fonts } from '../../theme';
import { w, h } from '../../theme';

export default styles = (size) =>
  StyleSheet.create({
    container: {
      width: w(size),
      height: w(size),
      borderRadius: w(size / 10),
    },
    containerBg: {
      width: w(size),
      height: w(size),
      borderRadius: w(size / 10),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    camera: {
      width: w(size / 2.5),
      height: w(size / 2.5),
    },
  });
