import { faSquare, faThLarge, faUserFriends, faMicrophoneLines, faPodcast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Room, RoomEvent, setLogLevel, VideoPresets } from 'livekit-client';
import { DisplayContext, DisplayOptions, LiveKitRoom, StageProps, ParticipantProps, ControlsProps } from '@livekit/react-components';
import { useState } from 'react';
import 'react-aspect-ratio/aspect-ratio.css';
import { useNavigate, useLocation } from 'react-router-dom';
import {HStack, VStack, Stack, Avatar, AvatarBadge, Box, Card, CardHeader, Heading, CardBody, Wrap, WrapItem } from '@chakra-ui/react'

export const RoomPage = () => {
  const [roomOwnerId, setRoomOwnerId] = useState('');
  const [roomName, setRoomName] = useState('');
  const [numParticipants, setNumParticipants] = useState(0);
  const [displayOptions, setDisplayOptions] = useState<DisplayOptions>({
    stageLayout: 'grid',
    showStats: false,
  });
  const navigate = useNavigate();
  // TODO: All this should come from ajax not in a redirect
  const query = new URLSearchParams(useLocation().search);
  const url = query.get('url') || '';
  const token = query.get('token');
  const recorder = query.get('recorder');

  if (!token) {
    return <div>token is required</div>;
  }

  const onLeave = () => {
    navigate('/');
  };

  const updateParticipantSize = (room: Room) => {
    setNumParticipants(room.participants.size + 1);
  };

  const updateRoomOwnerId = (roomOwnerId: string) => {
    setRoomOwnerId(roomOwnerId);
  };

  const updateRoomName = (room: Room) => {
    setRoomName(room.name);
  };

  const onParticipantDisconnected = (room: Room) => {
    updateParticipantSize(room);

    /* Special rule for recorder */
    if (recorder && parseInt(recorder, 10) === 1 && room.participants.size === 0) {
      console.log('END_RECORDING');
    }
  };

  const updateOptions = (options: DisplayOptions) => {
    setDisplayOptions({
      ...displayOptions,
      ...options,
    });
  };

  return (
    <Box padding='1em'>
    <Heading size='lg' padding='1em'><FontAwesomeIcon icon={faPodcast}/>&nbsp;{roomName}</Heading>
      <Wrap spacing='24px'>
        <LiveKitRoom
          url={url}
          token={token}
          onConnected={(room) => {
            setLogLevel('debug');
            onConnected(room, query);
            room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
            room.on(RoomEvent.ParticipantDisconnected, () => onParticipantDisconnected(room));
            updateParticipantSize(room);
            updateRoomName(room);
            // console.log('metadata:');
            // console.log(room.metadata);
            const metadata = room.metadata;
            if (metadata !== undefined) {
              const meta_object = JSON.parse(metadata);
              updateRoomOwnerId(meta_object['owner']);
            }
          }}
          roomOptions={{
            publishDefaults: {
              simulcast: true,
            },
          }}
          // stageRenderer renders the entire stage
          // stageRenderer={(props: StageProps) => {
          //   return <div />;
          // }}
          // participantRenderer renders a single participant
          participantRenderer={(props: ParticipantProps) => {
            const pmd = props.participant.metadata;
            console.log('pmd', pmd);

            let parsedMetadata;
            if (pmd !== undefined && pmd !== ''){
              parsedMetadata = JSON.parse(pmd);
             } else {
              return null;
             }
          
            // https://mravatar.r669.live/avatar/@holgerhuo@dragon-fly.club for mastodon avatar
            let permissionLevel;
            if (props.participant.identity == roomOwnerId) {
              permissionLevel = 'Host'
            } else if (props.participant.permissions?.canPublish) {
              permissionLevel = 'Speaker'
            } else {
              permissionLevel = 'Listener'
            };
            let speakingOutline = {};

            if (props.participant.audioLevel > 0) {
              speakingOutline = { outline: '5px solid #91b6ff' };
            }
            console.log(props)

            return <WrapItem><Card alignItems='center' >
              <Avatar style={speakingOutline} name={props.participant.name} src={parsedMetadata['avatar_url']}>
                {props.participant.permissions?.canPublish
                  ? <AvatarBadge boxSize='1.25em' bg='white'><span className='fa fa_question' style={{ color: "#000" }} ><FontAwesomeIcon icon={faMicrophoneLines} /></span></AvatarBadge>
                  : ''
                }
              </Avatar>
              <Heading size='md'>{props.participant.name}</Heading>
              <p>{permissionLevel}</p>
              <p>{props.participant.audioLevel}</p>
            </Card></WrapItem>;
          }}
          // controlRenderer renders the control bar
          controlRenderer={(props: ControlsProps) => {
            return <div />;
          }}
          onLeave={onLeave}
        />
      </Wrap>
    </Box>
  );
};

async function onConnected(room: Room, query: URLSearchParams) {
  // make it easier to debug
  (window as any).currentRoom = room;

  const audioDeviceId = query.get('audioDeviceId');
  if (audioDeviceId && room.options.audioCaptureDefaults) {
    room.options.audioCaptureDefaults.deviceId = audioDeviceId;
  }
  await room.localParticipant.setMicrophoneEnabled(true);
}

function isSet(query: URLSearchParams, key: string): boolean {
  return query.get(key) === '1' || query.get(key) === 'true';
}
