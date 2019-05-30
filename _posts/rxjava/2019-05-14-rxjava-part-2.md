---
layout: post
comments: false
title: "RxJava를 활용한 리액티브 프로그래밍 - Obaservable 처음 만들기"
date: 2019-05-30
image: '/assets/img/'
description:
main-class: dev
tags: rxjava reactive java books
categories: "RxJava"
---

# Observable 처음 만들기
## Observable
객체의 상태 변화를 관찰하는 관찰자들(Observer - 옵저버)가 관찰하는 대상을 말한다.

옵저버의 목록을 객체에 등록, 상태 변화가 있을 때마다 메서드를 호출하여 객체가 각 옵저버들에게 변화를 알려준다.  

사용자가 버튼을 누르면 미리 등록해준 onClick()을 실행하는 이벤트 처리 방식이 대표적인 옵저버 패턴이 적용된 사례이다.

## RxJava에서 Observable의 3가지의 알림 방식
- **onNext** : Observable이 데이터 발행을 알리는 메소드
- **onComplete** : 모든 데이터의 발행을 완료했을 때 호추로디느 메소드. onComplete 이벤트 발생은 단 한 번만 발생하게되고 발생한 후에는 **onNext**가 호출되어서는 안된다.
- **onError** : Obserable에서 에러 처리를 위한 메소드. onError이벤트 발생 후에는 Observable의 실행을 종료한다.

## Observable의 팩토리 함수
> 마블 다이어그램에 대한 설명은 [링크](https://medium.com/@jshvarts/read-marble-diagrams-like-a-pro-3d72934d3ef5)를 참고해주세요.

Observable을 생성할 때 직접 인스턴스를 만들지 않고 상황에 맞는 [정적 팩토리 메소드](https://dzone.com/articles/constructors-or-static-factory-methods)를 호출해서 인스턴스를 생성한다.

| 팩토리 메소드 | 메소드명 |
|-------------------------------|----------------------------------------------------------------------------|
| RxJava 1.x | create(), just(), from() |
| RxJava 2.x 추가 (from 세분화) | fromArray(), fromIterable(), fromCallable(), fromFuture(), fromPublisher() |
| 기타 | interval(), range(), timer(), defer() 등 |

### just() 함수
- 기존의 자료구조를 사용해서 Observable을 생성하는 메소드
- 한 개의 값을 넣을 수도 있고 인자로 여러 개의 값(최대 10개 - 동일 타입)를 넣을 수도 있음.
![just 함수](/assets/img/posts/rxjava/part2/just.png)
#### just() 함수와 데이터 인자
```java
public class Example {
    public void emit() {
        Observable.just(1, 2, 3, 4, 5)
        .subscribe(System.out::println);
    }
}
```
실행 결과는 다음과 같이 인자로 넣은 1~5를 그대로 발행합니다.
#### 결과
```plain
1
2
3
4
5
```
### subscribe() 메소드와 Disposable 객체

RxJava는 동작을 미리 정의해놓고 동작하는 시점을 조작할 수 잇다. 이 때 사용하는 것ㅇ subscribe() 메소드이다.
Observable의 데이터 흐름을 정의한 후(just() 등) 동작해야하는 시점에 subscribe() 메소드를 호출해야 실제로 데이터를 발행한다.
(subscribe의 메소드 원형에 대해서 자세히 보려면 [공식 문서](http://reactivex.io/RxJava/javadoc/io/reactivex/Observable.html#subscribe--)를 참고해주세요)

subscribe메소드는 모두 구독 해지에 관련된 Disposable 인터페이스의 객체를 리턴하는데 인터페이스에는 dispose(), isDisposed() 두 가지의 메소드만 존재한다.
```java
/**
 * Represents a disposable resource.
 */
public interface Disposable {
    /**
     * 구독을 해지하는 함수.
     */
    void dispose();

    /**
     * @return 구독이 해지되었는지 여부에 대한 boolean 값
     */
    boolean isDisposed();
}
```