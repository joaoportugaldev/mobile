package com.moko.support.scannergw.event;

public class MQTTSubscribeSuccessEvent {
    private String topic;

    public MQTTSubscribeSuccessEvent(String topic) {
        this.topic = topic;
    }

    public String getTopic() {
        return topic;
    }
}
