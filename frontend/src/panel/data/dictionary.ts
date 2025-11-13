// src/panel/data/dictionary.ts

export type Algorithm = {
    id: string;
    title: string;
    description: string;
    detail?: string;
};

export type Category = {
    id: string;
    name: string;
    summary?: string;
    algorithms: Algorithm[];
};

// 👉 대분류 + 알고리즘 데이터
export const CATEGORIES: Category[] = [
    {
        id: "ds",
        name: "자료구조",
        summary: "문자열, 배열, 트리, 힙 등 알고리즘 기반 구조들",
        algorithms: [
            {
                id: "stack",
                title: "스택 (Stack)",
                description: "LIFO 구조. 뒤에서 넣고 빼는 자료구조.",
                detail: "DFS 재귀, 되돌리기 기능 등에서 사용. push/pop O(1)."
            },
            {
                id: "queue",
                title: "큐 (Queue)",
                description: "FIFO 구조. 앞에서 빼고 뒤에서 넣는 자료구조.",
                detail: "BFS 구현, 작업 대기열 등에서 사용."
            },
            {
                id: "deque",
                title: "덱 (Deque)",
                description: "양쪽 끝에서 삽입/삭제 가능.",
                detail: "슬라이딩 윈도우, 양방향 탐색에 활용."
            },
            {
                id: "heap",
                title: "힙 (Heap)",
                description: "최소/최댓값 빠른 추출이 가능한 자료구조.",
                detail: "우선순위 큐, 다익스트라, MST 등에서 자주 쓰임."
            }
        ]
    },
    {
        id: "dp",
        name: "동적 계획법 (DP)",
        summary: "부분 문제의 해를 이용해 전체 문제 해를 계산",
        algorithms: [
            {
                id: "lis",
                title: "LIS",
                description: "가장 긴 증가하는 부분 수열",
                detail: "기본 DP O(N^2), 이분 탐색 X O(N log N)."
            },
            {
                id: "lcs",
                title: "LCS",
                description: "최장 공통 부분 수열",
                detail: "문자열 알고리즘의 기본 DP."
            },
            {
                id: "knapsack",
                title: "Knapsack",
                description: "무게 제한 내 값의 최댓값을 찾는 문제",
                detail: "0-1 배낭, 완전 배낭 등 변형 존재."
            }
        ]
    },
    {
        id: "graph",
        name: "그래프",
        summary: "정점/간선 구조와 탐색, 최단 거리, 연결성",
        algorithms: [
            {
                id: "bfs",
                title: "BFS",
                description: "너비 우선 탐색",
                detail: "최단 거리(간선 가중치 1) 탐색에 유용."
            },
            {
                id: "dfs",
                title: "DFS",
                description: "깊이 우선 탐색",
                detail: "백트래킹, 사이클 탐지 등에 활용."
            },
            {
                id: "dijkstra",
                title: "다익스트라",
                description: "가중치가 양수일 때 최단 경로",
                detail: "힙 사용 시 O(E log V)."
            }
        ]
    }
];
