---
layout: post
comments: false
title: "#1 RxJava를 활용한 리액티브 프로그래밍"
date: 2019-05-14
image: '/assets/img/'
description: "RxJava 시작하기"
main-class: dev
tags: rxjava reactive java
categories: "RxJava"
introduction: "RxJava 시작하기"
---
>프로젝트 구성 및 maven 혹은 gradle에 대한 설정은 과감히 생략하도록 한다.  
이미 다 알거라도 생각함.

# RxJava 의존성 추가
```gradle
dependencies {
    compile 'org.slf4j:slf4j-api:1.7.25'
    testCompile group: 'junit', name: 'junit', version: '4.12'
    compile 'io.reactivex.rxjava2:rxjava:2.2.8'
}
```

# Hello World 출력하기
```java
import io.reactivex.Observable;

public class FirstExample {

    private void emit() {
        Observable.just("Hello", "RxJava 2!!")
                .subscribe(System.out::println);
    }
    public static void main(String[] a) {
        FirstExample demo = new FirstExample();
        demo.emit();
    }
}
```
## 각 항목에 대한 설명
### Observable
 - 데이터의 변화가 발생하는 데이터 소스를 의미합니다.
 - Observer들이 구독하는 대상이고 Observer에게 데이터를 발행해주는 역할을 한다고 생각하고 넘어가셔도 됩니다(앞으로 계속해서 Observable에 대한 내용을 설명할 예정입니다.)

### just()
 - Observable의 선언 방식으로 변경없이 발행된 데이터를 그대로 구독자에게 전달한다고 생각하시면 됩니다.(자세한 내용은 나중에 올라올 포스팅을 참고해주세요)
 - 위 예제에서는 데이터 소스에서 'Hello'와 'RxJava 2!!'의 2개의 데이터를 발행하게 됩니다.
 - Generic에 명시된 타입에 맞는 데이터를 인자로 넣을 수 있습니다.

### subscribe()
 - Observable에 구독자를 등록하는 함수입니다.
 - 일반적인 Observer pattern에서의 subscribe와 동일하다고 생각하면 됩니다
 - 데이터를 수신 할 구독자가 함수를 호출하게되면 Observable에서 데이터가 발행합니다

### System.out::println
 - 수신한 데이터를 출력하도록 메소드 레퍼런스를 인자로 제공해 줍니다.
    - 혹시나 jdk8부터 지원하는 [method reference](https://dzone.com/articles/java-lambda-method-reference)를 잘모르신다면 링크를 참고해보세요

# 정리
자세한 설명을 하기에 앞서 우선 Hello world부터 작성하는 걸 목적으로 포스팅을 작성했습니다.  
다음 포스팅에서는 [Marble diagram](http://reactivex.io/documentation/observable.html)을 읽는 방법에 대해서 알아보면서 본격적인 Reactive programming에 대해서 알아보겠습니다.