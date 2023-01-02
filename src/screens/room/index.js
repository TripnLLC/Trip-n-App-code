import { useNavigation, useRoute } from '@react-navigation/core';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  View,
  SafeAreaView,
  StatusBar,
  ScrollView,
  BackHandler,
  // eslint-disable-next-line react-native/split-platform-components
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  AppBar,
  BarButton,
  Participant,
  ConfirmationMessage,
  Loader,
  showToast,
} from '../../components';

import styles from './styles';
import { PRESET } from '../../constants';
import { w } from '../../theme';
import { createAgoraRtcEngine, ChannelProfileType, ClientRoleType } from 'react-native-agora';
import { AgoraConfig } from '../../config/agora-config';
import {
  triggerLeaveRoom,
  triggerResetRoom,
  triggerUpdateMicStatus,
} from '../../redux/rooms/roomsSlice';
import firestore from '@react-native-firebase/firestore';
// import { TestIds, BannerAd, BannerAdSize } from '@react-native-firebase/admob';

const PROFILE_ICON = require('../../../assets/profile.png');

export const RoomScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const route = useRoute();
  const agoraEngineRef = useRef();

  const { poolSizes, defaultChatRoomSettings } = useSelector((state) => state.settings);
  const { profileUser } = useSelector((state) => state.general);
  const { allUsers } = useSelector((state) => state.friends);
  const {
    isLoadingFindRoom,
    room,
    roomId,
    roomSize,
    isLoadingLeaveRoom,
    leaveRoomError,
    leaveRoomSuccess,
  } = useSelector((state) => state.rooms);

  const [muteRoom, setMuteRoom] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [engine, setEngine] = useState();
  const [joinSucceed, setJoinSucceed] = useState(false);
  const [peerIds, setPeerIds] = useState([]);
  const [isVisibleLeaveConfirmatinMessage, setIsVisibleLeaveConfirmationMessage] = useState(false);
  const [isVisibleLoader, setIsVisibleLoader] = useState(false);

  const getPermission = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }
  };

  const setupEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      agoraEngine.registerEventHandler({
        onJoinChannelSuccess: () => {
          console.log('Successfully joined the channel ' + 'channelName');
          setJoinSucceed(true);
        },
        onUserJoined: (_connection, Uid) => {
          console.log('Remote user joined with uid ' + Uid);
          setPeerIds([...peerIds, Uid]);
        },
        onUserOffline: (_connection, Uid) => {
          console.log('Remote user left the channel. uid: ' + Uid);
          setPeerIds(peerIds.filter((id) => id !== Uid));
        },
      });
      await agoraEngine.initialize({
        appId: AgoraConfig.appId,
        channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
      });
      await agoraEngine.enableAudio();
      setTimeout(() => {
        join();
      }, 1000);
    } catch (e) {
      console.log(e);
    }
  };

  const join = async () => {
    try {
      agoraEngineRef.current?.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
      agoraEngineRef.current?.startPreview();
      agoraEngineRef.current?.joinChannel(AgoraConfig.token, 'channelName', 0, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const leaveChannel = () => {
    try {
      agoraEngineRef.current?.leaveChannel();
      setJoinSucceed(false);
      setPeerIds([]);
    } catch (e) {
      console.log(e);
    }
  };

  const onTapSpeakerChange = (data, status) => {
    engine
      ?.enableLocalAudio(status)
      .then(() => {
        dispatch(triggerUpdateMicStatus({ room, roomId, uid: profileUser?.id, status: !status }));
      })
      .catch((err) => {
        console.warn('enableLocalAudio', err);
      });
  };

  useEffect(() => {
    setupEngine();
    setParticipants(getReOrderedParticipants(room?.participants) ?? []);
    // const selectedPool = poolSizes.find(
    //   (x) => x.id === defaultChatRoomSettings.selectedPreferredPoolSize
    // );

    // if (selectedPool) {
    //   const list = [{ isMicOn: true, isSpeaking: false, name: 'Adam' }];
    //   for (let i = 0; i < parseInt(selectedPool.value) - 1; i++) {
    //     list.push({ isMicOn: true, isSpeaking: false, name: 'Devon' });
    //   }
    //   setParticipants(list);
    // }
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('rooms')
      .doc(roomId)
      .onSnapshot((documentSnapshot) => {
        console.log('room data >>>>>>>>>>>>>>>>>>>++++', documentSnapshot?.data());
        setParticipants(getReOrderedParticipants(documentSnapshot?.data()?.participants));
      });

    // Stop listening for updates when no longer required
    return () => subscriber();
  }, []);

  useEffect(() => {
    if (isLoadingLeaveRoom) return;
    if (leaveRoomError) return showToast(leaveRoomError);
    if (leaveRoomSuccess) {
      dispatch(triggerResetRoom());
      return navigation.popToTop();
    }
  }, [isLoadingLeaveRoom]);

  const getStyle = (index) => {
    if (index == 0) {
      return styles().middleParticipant;
    }
    if (index % 2 == 0) {
      if ((index + 1) % 3 == 0) {
        return styles(true).rightParticipant;
      } else {
        return styles().rightParticipant;
      }
    } else {
      if ((index + 1) % 3 == 0) {
        return styles(true).leftParticipant;
      } else {
        return styles().leftParticipant;
      }
    }
  };

  const getReOrderedParticipants = (list) => {
    const orderedList = [
      ...(list?.filter((el) => el.id == profileUser.id) ?? []),
      ...(list?.filter((el) => el.id != profileUser.id) ?? []),
    ];
    const generatedList = [];

    orderedList.forEach((element) => {
      if (element?.isLeft == undefined || element?.isLeft == null || element?.isLeft != true) {
        const filteredUser = allUsers?.filter((el) => el?.data().id == element.id);
        generatedList.push({
          ...element,
          name: (filteredUser[0]?.data()?.fullName?.split(' '))[0],
          imageUrl: filteredUser[0]?.data()?.imageUrl,
        });
      }
    });
    return generatedList;
  };

  const requestToLeaveChatRoom = async () => {
    setIsVisibleLoader(true);
    leaveChannel();
    setIsVisibleLoader(false);
    dispatch(triggerLeaveRoom({ roomId, uid: profileUser?.id }));
  };

  const renderParticipants = () => {
    return (
      <View style={styles().participantsContainer}>
        {participants?.map((item, index) => (
          <Participant
            key={index}
            style={[styles().participant, { ...getStyle(index), marginTop: w(80) * index }]}
            source={PROFILE_ICON}
            item={item}
            isCurrentUser={item.id == profileUser.id}
            isDisabled={item.id != profileUser.id}
            onPress={(data, status) => {
              onTapSpeakerChange(data, status);
            }}
          />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles().screen}>
      <StatusBar />
      {/* <View style={{ flexDirection: 'row' }}> */}
      <AppBar
        title="Room Name"
        onPressLeftIcon={() => {
          setIsVisibleLeaveConfirmationMessage(true);
          //navigation.popToTop();
        }}
      />
      {/* </View> */}
      <View style={styles().scrollContainer}>
        <ScrollView contentContainerStyle={styles().scrollView} scrollEnabled={true}>
          <View style={styles(false, participants?.length * w(90)).container}>
            <View style={styles().topContainer}>{renderParticipants()}</View>
          </View>
        </ScrollView>
      </View>
      <View style={styles().bottomContainer}>
        <View style={styles().leaveRoomContainer}>
          <BarButton
            style={styles().leaveRoom}
            preset={PRESET.INFO}
            size={58}
            title="Leave Room"
            isDisabled={false}
            onPress={() => {
              setIsVisibleLeaveConfirmationMessage(true);
              //navigation.popToTop();
            }}
          />
        </View>
        {/*<View style={styles().tapToMuteContainer}>
          <LinkButton
            title={muteRoom ? 'Tap to Unmute' : 'Tap to Mute'}
            style={styles().tapToMute}
            titleStyle={styles().tapToMuteTitle}
            preset={PRESET.SUCCESS}
            onPress={() => {
              setMuteRoom(!muteRoom);
            }}
          />
          </View>*/}
      </View>
      {/* <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.SMART_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('Advert loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.error('Advert failed to load: ', error);
        }}
        /> */}
      <ConfirmationMessage
        isVisible={isVisibleLeaveConfirmatinMessage}
        title="WARNING!"
        detail="Are you sure? do you really want to leave this chat room?"
        onTapNegative={() => {
          setIsVisibleLeaveConfirmationMessage(false);
        }}
        onTapPositive={() => {
          setIsVisibleLeaveConfirmationMessage(false);
          requestToLeaveChatRoom();
        }}
      />
      <Loader isVisible={isVisibleLoader} />
    </SafeAreaView>
  );
};
