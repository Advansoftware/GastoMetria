import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999,
    paddingTop: 0,
  },
  camera: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  button: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'black',
  },
  controlButton: {
    padding: 10,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default styles;
