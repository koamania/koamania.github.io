---
layout: post
comments: false
title: "#4 JPA 실무 - 서비스 및 repository 구현"
date: 2020-06-20
image: '/assets/img/'
description: "서비스 로직 구현과 repository 구현"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "서비스 로직 구현과 repository 구현"
---
## 생성 메서드
- 주문이라는 엔티티를 생성할 때 복잡하게 얽힌 엔티티를 연관관계로 세팅해주어야한다(Member, Delivery 등). 핵심이 되는 엔티티(Order)에 생성하는 로직을 만들어두면 일관성있는 동작을 강제할 수 있고 복잡한 비즈니스 로직을 한 눈에 알 수 있다.
- 복잡한 비즈니스 로직은 완결시키는 메소드로서의 역할

## 비즈니스 로직
- 비즈니스 로직에 대한 체크 로직을 엔티티 안에 위치시킨다. 엔티티를 풍부하게 만들어주어서 엔티티의 상태를 보장할 수 있다.(비즈니스 로직의 완결성?)

## Cascade에 대한 범위
- private owner인 경우에만 사용(라이프 사이클이 동일한 경우)에만 사용
- 다른 곳에서도 참조하는 엔티티가 많은 경우에는 별도로 persist등 처리를 해주는게 나음.

## **도메인 모델 패턴**과 **트랜잭션 스크립트 패턴**
- 비즈니스 로직 대부분이 엔티티에 위치하게되고 서비스 계층은 단순히 엔티티에 필요한 요청을 위임하는 역할을 한다.
- 이처럼 엔티티가 비즈니스 로직을 가지고 객체 지향의 특성을 적극 활용하는 것을 [*도메인 모델 패턴*](https://martinfowler.com/eaaCatalog/domainModel.html)이라고 한다.
- 반대로 엔티티에는 비즈니스 로직이 거의 없고 서비스 계층에서 대부분의 비즈니스 로직을 처리하는 것을 [*트랜잭션 스크립트 패턴*](https://martinfowler.com/eaaCatalog/transactionScript.html)이라 한다.
- JPA와 같은 ORM을 사용하는 경우 도메인 모델 패턴을 많이 사용하나 트랜잭션 스크립트 패턴이 안티 패턴은 아니다.
- 적절하게 섞어서 사용하는 경우도 있다.
- 도메인 모델 패턴의 경우 테스트 작성 시 단위테스트를 작성하기 더 간편해진다.(repository 등 종속성이 없이 검증이 가능하다.)