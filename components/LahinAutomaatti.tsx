import {useState, useEffect} from 'react';
import {Text, Appbar, Button, Card, Title,List} from 'react-native-paper';
import { StyleSheet, View} from 'react-native';
import * as Location from 'expo-location';

interface Automaatti {

    katuosoite: string
    postinumero: number
    postitoimipaikka: string
    koordinaatti_LAT: number
    koordinaatti_LON: number
}
interface Apidata {
    haettu: boolean
    osoitteet: Automaatti[]
    virhe: string
}

const LahinAutomaatti = () => {

    const [sijainti,setSijainti] = useState<any>(null);
    const [sijaintiHaettu, setSijaintiHaettu] = useState<Boolean>(false);
    const [lahinAutomaattiHaettu, setLahinAutomaattiHaettu] = useState<Boolean>(false);
    const [hakuTeksti, setHakuTeksti] = useState<string>('');
    const [virheViesti, setVirheViesti] = useState<string>('');
    const [lahinAutomaatti, setLahinAutomaatti] = useState<Automaatti>({
                                                    katuosoite: '',
                                                    postinumero: 0,
                                                    postitoimipaikka: '',
                                                    koordinaatti_LAT : 0,
                                                    koordinaatti_LON:0
                                                })                              
    const [etaisyys, setEtaisyys] = useState<number>(0);
    const [apiData, setApiData] = useState<Apidata>({
                                    haettu: true,
                                    osoitteet: [],
                                    virhe: ""
                                    })
    const kaynnistaHaku = async () => {

        const {status} = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted'){
            setVirheViesti('Lupaa sijainnin hakemiseen ei saatu')

        } else {
        setVirheViesti('');
        setSijaintiHaettu(true);
        setHakuTeksti("Hakee lähintä automaattia..");

        let sijainti = await Location.getCurrentPositionAsync({});
        setSijainti(JSON.stringify(sijainti));
        let lat_nyt = sijainti.coords.latitude;
        let lon_nyt = sijainti.coords.longitude;
        haeLahin(lat_nyt, lon_nyt);
        }
    
    }

    const apiKutsu = async () : Promise<void> => {
        try{

        let yhteys = await fetch(`http://192.168.1.121:3003/`);

        if (yhteys.ok){
          
            setApiData({
                ...apiData,
                osoitteet: await(yhteys.json()),
                haettu : true
            })
            } else{

            let virheteksti : string = "";

            switch (yhteys.status) {
                case 404 : virheteksti = "Not found"; break;
                default: virheteksti = "Palvelimella tapahtui odottamaton virhe"; break;
            }
            setApiData({
                ...apiData,
                haettu: true,
                virhe: virheteksti
                
            })
        }
        } catch (e: any){
            setApiData({
                ...apiData,
                haettu: true,
                virhe: "Palvelimeen ei saada yhteyttä"
                
            })

        }
    }
    const haeLahin = (lat_nyt: number, lon_nyt: number) => {

        let valimatka = 9999999;

         apiData.osoitteet.forEach((automaatti: Automaatti, idx: number) => {
            
            laskeValimatka(lat_nyt, lon_nyt, automaatti.koordinaatti_LAT, automaatti.koordinaatti_LON);
            if (laskeValimatka(lat_nyt, lon_nyt, automaatti.koordinaatti_LAT, automaatti.koordinaatti_LON) < valimatka){
                                    
                valimatka = laskeValimatka(lat_nyt, lon_nyt, automaatti.koordinaatti_LAT, automaatti.koordinaatti_LON);
                setLahinAutomaatti({
                    katuosoite: automaatti.katuosoite,
                    postinumero: automaatti.postinumero,
                    postitoimipaikka: automaatti.postitoimipaikka,
                    koordinaatti_LAT: automaatti.koordinaatti_LAT,
                    koordinaatti_LON: automaatti.koordinaatti_LON
                })
            }
            setEtaisyys(Math.round((laskeValimatka(lat_nyt, lon_nyt, automaatti.koordinaatti_LAT, automaatti.koordinaatti_LON)/1000)));
        })
        setLahinAutomaattiHaettu(true);
        setHakuTeksti('');
    }
    const laskeValimatka = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        lon1 = (Math.PI * lon1) /180;
        lon2 = (Math.PI * lon2) / 180;
        lat1 = (Math.PI * lat1) / 180;
        lat2 = (Math.PI * lat2) / 180;

        //Haversin formula
        let dlon = lon2 - lon1;
        let dlat = lat2 -lat1;
        let a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2)
                                                * Math.pow(Math.sin(dlon / 2), 2);
        let c = 2 * Math.asin(Math.sqrt(a));
        let r = 6371;
        
        return (c*r);

    }
    useEffect(() => {
        apiKutsu();
    }, []);

    return (
    <View style={styles.container}>
        <Appbar.Header>
        { (lahinAutomaattiHaettu) ?
            <Button
                onPress= {() =>setLahinAutomaattiHaettu(false)}
                mode='contained'>
            Sulje osoitetiedot
            </Button>
            :   (hakuTeksti) ?
            <Button
                loading={true}
                mode='contained'
                >{hakuTeksti}</Button>
            :
            <Button
                onPress={() => {
                    kaynnistaHaku()}}
                mode='contained'
            >Hae lähintä automaattia</Button>
        }
        </Appbar.Header>
    { (sijaintiHaettu && lahinAutomaattiHaettu) ? 
    <Card style= {styles.card}>
        <Card.Content>
            <List.Section>
                <List.Subheader 
                    style={{fontSize:16}}>Osoitetiedot:</List.Subheader>
                    <List.Item
                    title={lahinAutomaatti.katuosoite}
                    left={() => <List.Icon icon="map-marker" />}
                    />
                    <List.Item
                    title= {lahinAutomaatti.postinumero}
                    description={lahinAutomaatti.postitoimipaikka}
                    left={() => <List.Icon icon="" />}
                    />
                <List.Subheader style={{fontSize:16}}>Automaatin etäisyys linnuntietä:</List.Subheader>
                    <List.Item
                    title={etaisyys.toFixed(2)}
                    description="km"
                    left={() => <List.Icon icon="map-marker-distance"/>}
                    />
            </List.Section>
        </Card.Content>
    </Card>
    : <Text>{virheViesti}</Text>

    }  
    </View>

    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    card: {
      width: 300,
      height:400


    }
});
export default LahinAutomaatti;