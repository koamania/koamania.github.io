---
layout: post
comments: false
title: "RxJava를 활용한 리액티브 프로그래밍 - 개요"
date: 2019-05-04
image: '/assets/img/'
description: "RxJava를 활용한 리액티브 프로그래밍 - 개요"
main-class: dev
color:
tags: rxjava reactive java books
categories: "RxJava"
introduction:
---

# 명령형 프로그래밍과 리액티브 프로그래밍
## 명령형 프로그래밍
프로그래머가 작성한 코드가 정해진 절차에 따라 순서대로 실행되는 형식이다.  
일반적인 프로그래밍의 방식으로 **프로그램을 실행 signal이 일어나면 정해진 순서에 맞게 명령을 실행하는 방식**이다.

## 리액티브 프로그래밍
**데이터 흐름을 먼저 정의하고 데이터가 변경되었을 때 연관되는 함수나 수식이 업데이트 되는 방식**을 말한다.  
새롭게 생긴 개념은 아니고 너무나도 익숙한 UI 구현시에 많이 이용했던 방법이다.

쉽게 말해 javascript로 웹 프론트엔드 코드를 작성할 때 특정 event에 대해서 지정된 view가 반응할 동작을 미리 정의해놓는 방식(addEventListener등을 이용해서)이 리액티브 프로그래밍이다.

# 자바와 리액티브 프로그래밍
자바에서 리액티브 프로그래밍을 한다는 것은 두 가지의 관계로 정리할 수 있다.
> - 기존 pull방식의 프로그래밍 개념을 push방식의 프로그래밍 개념으로 바꾼다.
> - 함수형 프로그래밍의 지원을 받는다.

## pull 방식과 push 방식
간단한 예제를 통해서 push 방식을 이해해보자.

나는 저번 주에 하루 4시간씩 시급 10,000원의 아르바이트를 5일 동안 했고 받은 급여의 내용일 날짜별로 노트에 기록했다.  
노트에 기뢱된 1일차 4만원, 2일차 4만원 ... 이런식으로 각 날짜별로 받은 급여를 모두 더하면 20만원이 될 것이다.

그런데 곰곰히 생각해보니까 3일차에는 2시간 연장근무를 했었던 것이다.  
3일차의 급여를 수정하고 난 후 다시 급여를 계산하기 위해서는 1일차부터 5일차까지의 기록을 읽어와서(혹은 가져와서. pull 방식) 다시 더할 것이다.(물론 바보가 아닌 이상에야 이렇게 하지 않겠지만)

반대로 10명의 아르바이트생을 위와 같은 조건으로 고용한 점주의 입장에서 생각해보자.  
아르바이트 직원들에게 급여를 주기위해서 모든 근무 일지를 확인하고 각가에게 나눠줄 급여를 분류했는데 위와 마찬가지로 한명의 근무 시간을 다시 계산해야 할 상황이 되었다.  
그럼 이 상황에서는 어떻게 처리하겠는가?

해당 직원의 근무 기록을 수정하고 모든 직원의 근무일지를 가져와서(pull방식) 다시 급여를 계산하는 방법도 있겠지만 상식적으로도 이렇게는 안할것이다.  
그냥 분류해뒀던 급여에서 변경된 직원의 봉투에 2만원만 넣어주면 해결될 문제다.
적절한 예는 아닐 수 있겠지만 이게 push 방식이다.

> 데이터의 변화가 발생했을 때 변경이 발생한 곳에서 새로운 데이터를 보내고 변경사항을 감지한 대상이 동작을 수행하는 방식

## 함수형 프로그래밍

우리가 아는 콜백이나 옵저버 패턴으로 위의 내용을 구현할 수도 있다.  
하지만 옵저버가 1개이거나 단일 스레드 상황에서는 큰 문제가 없지만 멀티 스레드 환경에서는 데드락과 동기화 문제등으로 인해서 주의해야 할 상황이 많다.  
그래서 리액티브 프로그래밍에서는 **함수형 프로그래밍**이 필수적으로 따라오게 된다.  
*함수형 프로그래밍은 순수함수(pure fuction)을 지향하기 때문에 멀티 스레드 환경에서의 side effect에 대해서 걱정하지 않아도 된다*.

# RxJava를 만들게 된 이유
RxJava는 2013년 넥플릿스의 기술 블로그에서 처음 소개되었다.

.NET 환경의 리액티브 확장 라이브러리(Rx)를 JVM에 포팅했고 이게 바로 RxJava다.

만들게 된 핵심적인 이유는 3가지로 요약할 수 있다.

- 자바가 동시성 처리를 하는데 있어서 번거롭다.
- 자바 Future를 조합하기 어렵다는 점을 해결해야 한다.
- 콜백 방식의 문제점을 개선해야 한다(콜백 지옥)).

다수의 비동기 실행 흐름을 생성하고 결과를 취합하기 위해선 당시 자바(JDK 7. 이때는 CompletableFuture 같은 API가 제공되지 않았다)를 이용해선 로직이 너무 복잡해지고 다수의 Callback으로 인해 코드가 난잡해 질 수 밖에 없었다.

이를 개선하기 위해서 나온게 RxJava이고 리액티브 프로그래밍의 최대의 강점이라고도 생각한다.

# 정리
리액티브 프로그래밍은 새로 튀어나온 개념은 아니다.  
모놀리식을 지향하던 서비스 아키텍쳐가 마이크로 서비스를 지향하면서 서비스별로 다른 API를 제공하게되고 이를 하나도 조합하기 위해선 기존 명령형 프로그래밍으로는 한계가 명확했기때문에 화두가 된 것이다.  

다음 장부터는 RxJava를 활용해서 비지니스 로직에서의 리액티브 프로그래밍 적용에 대해서 본격적으로 정리 할 예정이다.