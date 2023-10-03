import {useState} from 'react';
import {BottomNavigation, Text} from 'react-native-paper';
import QrLukija from './components/QrLukija';
import LahinAutomaatti from './components/LahinAutomaatti';


const ottoAutomReitti = () => <LahinAutomaatti/>
const qrLukijaReitti = () => <QrLukija/>


export default function App() {

  const [index, setIndex] = useState<number>(0);
  const [routes] = useState([{key: 'otto', title: 'Etsi lähin automaatti', focusedIcon: 'map'},
                              {key: 'qr', title: 'qr-lukija', focusedIcon: 'barcode-scan'} ]);

  const renderScene = BottomNavigation.SceneMap({
    otto : ottoAutomReitti,
    qr : qrLukijaReitti
  });


  return (
  <>
    <BottomNavigation
      navigationState= {{index, routes}}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  </>
  );
}

