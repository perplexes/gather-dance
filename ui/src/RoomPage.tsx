import { faSquare, faThLarge, faUserFriends, faMicrophoneLines, faPodcast } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Room, RoomEvent, setLogLevel, VideoPresets } from 'livekit-client';
import { DisplayContext, DisplayOptions, LiveKitRoom, StageProps, ParticipantProps, ControlsProps, ControlsView } from '@livekit/react-components';
import { useState, useEffect } from 'react';
import 'react-aspect-ratio/aspect-ratio.css';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {HStack, VStack, Stack, Avatar, AvatarBadge, Box, Card, CardHeader, Heading, CardBody, Wrap, WrapItem } from '@chakra-ui/react'

export const RoomPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { sid } = useParams();

  const {token, avatarUrl, mastodonAddress} = state || {};
  const [roomOwnerId, setRoomOwnerId] = useState('');
  const [roomName, setRoomName] = useState(state ? state.roomName : null);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);



  // const [numParticipants, setNumParticipants] = useState(0);
  // TODO: All this should come from ajax not in a redirect

  let url = 'wss://livekit.honk.cafe';
  if (process.env.NODE_ENV == 'development'){
    url = 'ws://' + window.location.hostname + ':7880'
  }

  const onLeave = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!token && sid) {
      navigate('/', {state: {sid}});
    }
  }, [token, sid]);

if (!token) {
  return null;
}

  // const updateParticipantSize = (room: Room) => {
  //   setNumParticipants(room.participants.size + 1);
  // };

  const updateRoomOwnerId = (roomOwnerId: string) => {
    setRoomOwnerId(roomOwnerId);
  };

  // Should happen when room data changes but not on connect -- get data from API response instead
  const updateRoomName = (room: Room) => {
    setRoomName(room.name);
  };

  // const onParticipantDisconnected = (room: Room) => {
  //   updateParticipantSize(room);
  // };

  type ParsedMetadata = {
    avatarUrl: string;
    mastodonAddress: string;
  }

  return (
    <Box padding='1em'>
    <Heading size='lg' padding='1em'><FontAwesomeIcon icon={faPodcast}/>&nbsp;{roomName}</Heading>
      <Wrap spacing='24px'>
        <LiveKitRoom
          url={url}
          token={token}
          onConnected={(room) => {
            setLogLevel('debug');
            // room.on(RoomEvent.ParticipantConnected, () => updateParticipantSize(room));
            // room.on(RoomEvent.ParticipantDisconnected, () => onParticipantDisconnected(room));
            // updateParticipantSize(room);
            // updateRoomName(room);
            // console.log('metadata:');
            // console.log(room.metadata);
            const metadata = room.metadata;
            if (metadata !== undefined) {
              const meta_object = JSON.parse(metadata);
              updateRoomOwnerId(meta_object['owner']);
            }
            // onConnected(room);
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
            const {participant} = props;
            const {metadata, identity, permissions, audioLevel, name} = participant;
            var parsedMetadata = { avatarUrl: '', mastodonAddress: '' } as ParsedMetadata;

            if (metadata !== undefined && metadata !== '') {
              parsedMetadata = JSON.parse(metadata);
            }
            if(participant.isLocal){
              parsedMetadata.avatarUrl = avatarUrl;
              parsedMetadata.mastodonAddress = mastodonAddress;
              // This should cause 'ParticipantMetadataChanged' to fire
              participant.setMetadata(JSON.stringify(parsedMetadata));
            }
          
            // https://mravatar.r669.live/avatar/@holgerhuo@dragon-fly.club for mastodon avatar
            let permissionLevel;
            if (identity == roomOwnerId) {
              permissionLevel = 'Host'
            } else if (permissions?.canPublish) {
              permissionLevel = 'Speaker'
            } else {
              permissionLevel = 'Listener'
            };
            let speakingOutline = {};

            if (audioLevel > 0) {
              speakingOutline = { outline: '5px solid #91b6ff' };
            }
            console.log(props)

            return <WrapItem><Card alignItems='center' >
              <Avatar style={speakingOutline} name={name} src={parsedMetadata.avatarUrl}>
                {permissions?.canPublish
                  ? <AvatarBadge boxSize='1.25em' bg='white'><span className='fa fa_question' style={{ color: "#000" }} ><FontAwesomeIcon icon={faMicrophoneLines} /></span></AvatarBadge>
                  : ''
                }
              </Avatar>
              <Heading size='md'>{name}</Heading>
              <p>{permissionLevel}</p>
              <p>{audioLevel}</p>
            </Card></WrapItem>;
          }}
          // controlRenderer renders the control bar
          controlRenderer={(props: ControlsProps) => {
            return <ControlsView {...props} enableScreenShare={false} enableAudio={true} enableVideo={false} />;
          }}
          onLeave={onLeave}
        />
      </Wrap>
    </Box>
  );
};

// async function onConnected(room: Room, query: URLSearchParams) {
//   // make it easier to debug
//   (window as any).currentRoom = room;

//   const audioDeviceId = query.get('audioDeviceId');
//   if (audioDeviceId && room.options.audioCaptureDefaults) {
//     room.options.audioCaptureDefaults.deviceId = audioDeviceId;
//   }
//   await room.localParticipant.setMicrophoneEnabled(true);
// }

// function isSet(query: URLSearchParams, key: string): boolean {
//   return query.get(key) === '1' || query.get(key) === 'true';
// }
