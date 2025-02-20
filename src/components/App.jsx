import Layout from "./Layout";
import { AppProvider } from "../contexts/App";
import { AuthProvider } from "../contexts/Auth";
import { SettingsProvider } from "../contexts/Settings";
import { DraftProvider } from "../contexts/Draft";

export default function App() {
  return <Layout />;
  // return (
  //   <AppProvider>
  //     <AuthProvider>
  //       <SettingsProvider>
  //         <DraftProvider>
  //           <Layout />
  //         </DraftProvider>
  //       </SettingsProvider>
  //     </AuthProvider>
  //   </AppProvider>
  // );
}
