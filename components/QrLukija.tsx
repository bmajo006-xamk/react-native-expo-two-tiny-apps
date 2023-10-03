import {useState} from 'react';
import { StyleSheet, View} from 'react-native';
import {Button, FAB, Text} from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { WebView } from 'react-native-webview';

const  QrLukija = () => {

    const [qrTila, setQrTila] = useState<boolean>(false);
    const [qrOsoite, setQrOsoite] = useState<any>();
    const [webView, setWebView] = useState<boolean>(false);
    const [virheteksti, setVirheteksti] = useState<string>('');


    const kaynnistaQr = async () => {

        setWebView(false);
        setVirheteksti('');
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        if (status == 'granted'){
        setQrTila(true);
        } 
      }

    const handleSkannaa  = async ({data} : any) => {

      let regex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

        if (regex.test(data)){
          setQrOsoite(data);
          setQrTila(false);
          setWebView(true);
        } else {
          setQrTila(false);
          setVirheteksti("Virheellinen url");
        }
    
      };
    
    return (
        <>
          { (!qrTila && !webView) ?
          <View
          style = {styles.container}>
            <Button 
            icon = 'barcode-scan'
            mode='contained'
            onPress = {() => {kaynnistaQr();} }>Käynnistä QR-lukija</Button>
          </View>
            : null
          }
          <View style={{width: 120,height: 160, alignItems: 'center', justifyContent: 'center'}}>
          { (webView) ? 
          <FAB
          style={styles.webSuljeNappi}
          icon="close"
          label="sulje sivu"
          onPress= {() => {setWebView(false);}}
          />
          : null
          }
        </View>
        { (qrTila) ? 
        <View style={styles.container}>
          <View style= {styles.barCodeBoxi}>
          <BarCodeScanner
            onBarCodeScanned={handleSkannaa}
            style={{height: 540, width: 440}}
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
          />
          </View>
          <FAB
            size="small"
            icon= "close"
            label="sulje"
            style={styles.qrSuljeNappi}
            onPress = { () => {setQrTila(false)}}
          />
        </View>
        : null
        }
        { (virheteksti) ?
        <Button style={{bottom: 120, alignItems: 'center'}}>{virheteksti}</Button>
         :  (webView) ? 
        <>
          <WebView
          style={styles.container}
          source={{ uri: qrOsoite }}
          />
        </>
        : null}
      </>
    
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    barCodeBoxi: {
      backgroundColor: '#ffff',
      alignItems: 'center',
      justifyContent: 'center',
      height: 300,
      width: 300,
      overflow: 'hidden',
      borderRadius: 80,
      bottom: 120
  
    },
    qrSuljeNappi : {
      position: 'absolute',
      bottom: 100
    },
    webSuljeNappi : {
      top : 32,
      left: 240
    }
  });
export default QrLukija;