---
layout: post
comments: false
title: "#2 JPA 프로그래밍 - 상속 관계"
date: 2020-06-06
image: '/assets/img/'
description: "JPA에서의 상속 관계 매핑 전략"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "JPA에서의 상속 관계 매핑 전략"
---

# @MappedSuperclass
* 공통 정보를 매핑하기 위한 클래스
* 부모 클래스에 선언하고 속성만 상속 받아서 사용하고 싶을 때
* DB 테이블과는 전혀 상관 없다.

## 특징
* __@MappedSuperclass__가 선언되어 있는 클래스는 엔티티가 아니다. 당연히 테이블과 매핑도 안된다.
* 조회, 검색이 불가능하다. 부모 타입으로 조회하는 것이 불가능.
* 추상 클래스로 만드는 것을 권장
* 주로 등록일, 수정일 등 엔티티들의 공통으로 적용하는 정보를 모을 때 사용함.