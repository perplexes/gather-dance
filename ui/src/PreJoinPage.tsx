import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { createLocalVideoTrack, LocalVideoTrack } from 'livekit-client';
import { AudioSelectButton, ControlButton, VideoSelectButton } from '@livekit/react-components';
import { VideoRenderer } from '@livekit/react-core';
import { ReactElement, useEffect, useState, useRef } from 'react';
import { AspectRatio } from 'react-aspect-ratio';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Box,
  Input,
  Button,
} from '@chakra-ui/react'

type FormValues = {
  room: string;
  mastodon_address: string;
};

type ApiResponse = {
  jwt_token: string;
  avatar_url: string;
  mastodon_address: string;
}

export const PreJoinPage = () => {
  // initial state from query parameters
  const { register, handleSubmit, watch, formState: { errors } } = useForm <FormValues>();
  const [token, setToken] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  let apiRooms = 'https://api.honk.cafe/rooms';
  let room;
  let mastodon_address;
  if (process.env.NODE_ENV == 'development') {
    apiRooms =  window.location.protocol + '//' + window.location.hostname + ':4567/rooms'
    room = 'mx2'
    mastodon_address = '@silkroad@brands.town'
  }
  
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);

  // TODO: Maybe also use twitch grpc here
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const responseRaw = await fetch(apiRooms, {method: 'POST', body: JSON.stringify(data)});
    const responseObj = await responseRaw.json() as ApiResponse;
    const state = {
      token: responseObj.jwt_token,
      avatarUrl: responseObj.avatar_url,
      mastodonAddress: responseObj.mastodon_address,
    };
    navigate('/room', {state});
  }

  return (
    <Box width='50%'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormControl>
        <FormLabel>Room Name</FormLabel>
          <Input value={room} {...register('room')} />
        <FormLabel>Mastodon Account Adddress (@you@thing.social)</FormLabel>
        <Input value={mastodon_address} {...register('mastodon_address')} />
        <Input type='submit' />
        </FormControl>
      </form>
    </Box>
  );
};
