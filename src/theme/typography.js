import { Platform } from 'react-native';

export const typography = {
  fonts: {
    regular: Platform.select({ ios: 'Inter-Regular', android: 'Inter-Regular', default: 'System' }),
    medium: Platform.select({ ios: 'Inter-Medium', android: 'Inter-Medium', default: 'System' }),
    semibold: Platform.select({ ios: 'Inter-SemiBold', android: 'Inter-SemiBold', default: 'System' }),
    bold: Platform.select({ ios: 'Inter-Bold', android: 'Inter-Bold', default: 'System' }),
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
};

export default typography;
