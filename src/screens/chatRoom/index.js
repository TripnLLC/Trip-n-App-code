import { useNavigation } from '@react-navigation/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { View, Text, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import {
    AppBar,
    Loader,
} from '../../components';
import {
    triggerGetGlobalSettings,
} from '../../redux/settings/settingsSlice';

import styles from './styles';

export const ChatRoomScreen = () => {

    const navigation = useNavigation();
    const dispatch = useDispatch();

    const {
        isLoading,
        isLoadingGetUserChatSettings,
    } = useSelector((state) => state.settings);
    const { user, profileUser } = useSelector((state) => state.general);
    const [isVisibleOneOnOneConfirmation, setIsVisibleOneOnOneConfirmation] = useState(false);

    useEffect(() => {
        dispatch(triggerGetGlobalSettings(user?.uid ?? null));
    }, []);

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar />
            <AppBar />
            <ScrollView contentContainerStyle={styles.scrollView}>

                <Loader isVisible={isLoading || isLoadingGetUserChatSettings} />
            </ScrollView>
        </SafeAreaView>
    );
};