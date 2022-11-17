import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { AudioSelectButton, ControlButton, VideoSelectButton } from '@livekit/react-components';
import { VideoRenderer } from '@livekit/react-core';
import { ReactElement, useEffect, useState } from 'react';
import { AspectRatio } from 'react-aspect-ratio';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Box,
  Input,
  Button,
} from '@chakra-ui/react'

export const PreJoinPage = () => {
  // initial state from query parameters
  const searchParams = new URLSearchParams(window.location.search);

  return (
    <Box width='50%'>
      <form action={window.location.protocol+'//'+window.location.hostname+':4567/rooms'} method='post'>
        <FormControl>
        <FormLabel>Room Name</FormLabel>
        <Input type='text' name='room' />
        <FormLabel>Mastodon Account Adddress (@you@thing.social)</FormLabel>
        <Input type='text' name='mastodon_address' />
        <Button type='submit'>Submit</Button>
        </FormControl>
      </form>
    </Box>
  );
};
