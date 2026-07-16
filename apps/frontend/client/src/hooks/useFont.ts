import * as Font from 'expo-font';

export default async function useFonts() {
    await Font.loadAsync({
        'Poppins_100Thin': require('../../assets/fonts/Poppins-Thin.ttf'),
        'Poppins_100Thin_Italic': require('../../assets/fonts/Poppins-ThinItalic.ttf'),
        'Poppins_200ExtraLight': require('../../assets/fonts/Poppins-ExtraLight.ttf'),
        'Poppins_200ExtraLight_Italic': require('../../assets/fonts/Poppins-ExtraLightItalic.ttf'),
        'Poppins_300Light': require('../../assets/fonts/Poppins-Light.ttf'),
        'Poppins_300Light_Italic': require('../../assets/fonts/Poppins-LightItalic.ttf'),
        'Poppins_400Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
        'Poppins_400Regular_Italic': require('../../assets/fonts/Poppins-Italic.ttf'),
        'Poppins_500Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
        'Poppins_500Medium_Italic': require('../../assets/fonts/Poppins-MediumItalic.ttf'),
        'Poppins_600SemiBold': require('../../assets/fonts/Poppins-SemiBold.ttf'),
        'Poppins_600SemiBold_Italic': require('../../assets/fonts/Poppins-SemiBoldItalic.ttf'),
        'Poppins_700Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
        'Poppins_700Bold_Italic': require('../../assets/fonts/Poppins-BoldItalic.ttf'),
        'Poppins_800ExtraBold': require('../../assets/fonts/Poppins-ExtraBold.ttf'),
        'Poppins_800ExtraBold_Italic': require('../../assets/fonts/Poppins-ExtraBoldItalic.ttf'),
        'Poppins_900Black': require('../../assets/fonts/Poppins-Black.ttf'),
        'Poppins_900Black_Italic': require('../../assets/fonts/Poppins-BlackItalic.ttf'),
    });
}
