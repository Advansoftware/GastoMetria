import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Câmera',
        }}
      />
    </Tabs>
  );
}
