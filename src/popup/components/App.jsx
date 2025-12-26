import Layout from "./Layout";
// import { PublishProvider } from "../context/publishContext";
// import { AuthProvider } from "../context/authContext";
// import { SettingsProvider } from "../context/settingsContext";
// import { DraftProvider } from "../context/draftContext";

export default function App() {
  // TODO: Look into providers after adding unit tests
  // We are using the default context for now
  return (
    //   <AppProvider>
    //     <AuthProvider>
    //       <SettingsProvider>
    //         <DraftProvider>
    <Layout />
    //         </DraftProvider>
    //       </SettingsProvider>
    //     </AuthProvider>
    //   </AppProvider>
  );
}
