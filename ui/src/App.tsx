import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  // theme,
  extendTheme,
} from "@chakra-ui/react"
import { ColorModeSwitcher } from "./ColorModeSwitcher"
import { Logo } from "./Logo"
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import { PreJoinPage } from './PreJoinPage';
import { RoomPage } from './RoomPage';

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({ colors })

export const App = () => (
  <ChakraProvider theme={theme}>
    <Router>
      <Routes>
        <Route path="/room/:sid" element={<RoomPage />} />
        <Route path="/" element={<PreJoinPage />} />
      </Routes>
    </Router>
  </ChakraProvider>
)
