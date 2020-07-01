---
layout: post
comments: false
title: "#10 JPA 실무 - API 고급 - Collection 조회 최적화"
date: 2020-06-30
image: '/assets/img/'
description: "API 고급 - Collection 조회 최적화"
main-class: dev
tags: jpa java
categories: "JPA"
introduction: "API 고급 - Collection 조회 최적화"
---
# Collection 조회 성능 최적화하는 단계적 방법
## xToMany
### Entity 노출에 대한 문제
- Entity를 외부에 노출하지 말라는건 모든 Entity를 DTO로 변환해서 내려줘야 한다는 뜻
```java
public class DTO {
  // OrderItem Entity
  // 잘못된 부분
  private List<OrderItem> orderItems;
}
```
### DTO로 변환
- 모든 Object는 DTO로 변환해서 내려줘야 함
- 하지만 마찬가지로 N+1 문제때문에 성능이 안좋음

### Fetch join
- 쿼리가 N번 도는 문제를 해결할 수 있음
- Cartesian Product의 문제가 발생할 수 있으므로 distinct 등으로 해결해줘야 함


#### distinct
- 중복 제거(쿼리로 변환되었을 때 distinct 키워드 하나 붙여준다)
- @Id를 기준으로 엔티티를 중복 제거해준다
- db의 distinct 키워드는 row가 완벽하게 동일하지 않아서 의미가 없을 수 있음
- jqpl의 distinct는 중복 엔티티가 제거되기때문에 

#### 단점
- **페이징이 불가능**

> **참고**
> - collection fetch join을 사용하면 페이징이 불가능하다.
>    - hibernate는 경고 로그를 남기고 모든 데이터를 DB에서 읽어온 후 메모리에서 페이징 해버린다.
> - collection fetch join은 1개만 사용할 수 있음. 둘 이상의 fetch join을 사용할 경우 데이터가 부정합하게 조회될 수 있다.

### 페이징과 한계 돌파
1. xToOne 관계를 모두 fetch join 한다.(cartesian product가 발생하지 않음)
2. xToMany 관계를 모두 Lazy로 설정한다.
3. spring.jpa.hibernate.default_batch_fetch_size를 적용하게되면 lazy load할 때 in query로 검색하게된다.

- fetch join 되어 있는 xToOne 관계는 페이징에 영향을 미치지 않음
- root 엔티티는 정상적으로 페이징이 적용된 쿼리가 날아가게 됨
- collection을 fetch join 했을 때 보다 중복 데이터가 없어 데이터 전송량이 줄어든다.
- 상황에 따라서는 lazy하게 로드하는데 fetch join보다 빠를 수 있다(중복 데이터를 전송받는데 걸리는 시간... connection 및 transaction 유지하는게 일반적으로는 더 느리긴 함)
- in query를 사용하기 때문에 in query size가 1000개 제약인 DB(오라클...)인 경우애는 오류가 발생할 수 있음. 100~100개 정도가 적당함.

### dto로 직접 조회
- Query : 루트 1번, collection N번 실행
- xToOne 관계는 fetch join으로 먼저 조회, xToMany 관계는 각각 별도로 처리한다.
- 다만 루프로 돌면서 쿼리를 실행할 경우 마찬가지로 N+1로 실행될 수 있으므로 in query + 메모리에 로드한 후 mapping하는 방법을 사용한다.

### 플랫 데이터 최적화
- 쿼리는 한번이지만 조인으로 인해 DB에서 애플리케이션에서 전달하는 데이터에 중복 데이터가 추가되므로 상황에 따라 dto root 1번, collection n번 실행보다 느릴 수 있다
- grouping을 위해서 별도의 어플리케이션에서의 처리가 필요할 수 있다.
- 페이징 불가능

# 정리
- 엔티티 조회하는 방식을 권장
  - Fetch Join 등을 활용
  - 약간의 옵션 변경으로도 성능 최적화가 가능
  - JPA, Hibernate에서 성능 최적화를 위한 기능을 적극 활용할 수 있음
  - DTO를 직접 조회하는건 직접 쿼리를 이용하는거랑 큰 차이는 없음
- 캐시 사용
  - 엔티티는 절대로 cache에 넣어선 안됨
  - dto객체로 변환 후 넣어야 함
- 상황에 맞는 전략을 잘 선택해서 entity -> dto, dto 직접 조회, flat data -> 코드 레벨 처리 중 잘 선택해야 함
  - 핵심은 페이징, 데이터 갯수, 트래픽, index 등