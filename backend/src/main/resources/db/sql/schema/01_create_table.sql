-- CREATE TABLE SQL

-- 사용자
CREATE TABLE users (
    user_id INT GENERATED ALWAYS AS IDENTITY,
    social_id VARCHAR(100) NOT NULL,
    social_type TEXT NOT NULL DEFAULT 'kakao' CHECK (social_type in ('kakao')),
    nickname VARCHAR(100) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uq_social_id UNIQUE (social_id)
);

-- 알고리즘
CREATE TABLE algorithm (
    algorithm_id INT GENERATED ALWAYS AS IDENTITY,
    algorithm_name TEXT NOT NULL,
    definition TEXT,
    CONSTRAINT pk_algorithm PRIMARY KEY (algorithm_id),
    CONSTRAINT uq_algorithm_name UNIQUE (algorithm_name)
);

-- 알고리즘 사전
CREATE TABLE algorithm_dictionary (
    algorithm_dictionary_id INT GENERATED ALWAYS AS IDENTITY,
    algorithm_id INT NOT NULL,
    algorithm_name TEXT NOT NULL,
    definition TEXT NOT NULL,
    example TEXT NOT NULL,
    CONSTRAINT pk_algorithm_dictionary PRIMARY KEY (algorithm_dictionary_id),
    CONSTRAINT uq_algorithm_dictionary UNIQUE (algorithm_id, algorithm_name),
    CONSTRAINT fk_algorithm_dictionary_algorithm FOREIGN KEY (algorithm_id) REFERENCES algorithm(algorithm_id) ON DELETE CASCADE
);

-- 주간 목표
CREATE TABLE weekly_goal (
    weekly_goal_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    week_start_date DATE NOT NULL,
    CONSTRAINT pk_weekly_goal PRIMARY KEY (weekly_goal_id),
    CONSTRAINT uq_weekly_goal UNIQUE (user_id, week_start_date),
    CONSTRAINT fk_weekly_goal_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 일간 목표
CREATE TABLE daily_goal (
    daily_goal_id INT GENERATED ALWAYS AS IDENTITY,
    weekly_goal_id INT NOT NULL,
    algorithm_id INT NOT NULL,
    goal_date DATE NOT NULL,
    goal_count INT NOT NULL CHECK ( goal_count >= 0 ),
    solve_count INT NOT NULL DEFAULT 0 CHECK ( solve_count >= 0 AND solve_count <= goal_count ),
    CONSTRAINT pk_daily_goal PRIMARY KEY (daily_goal_id),
    CONSTRAINT uq_daily_goal UNIQUE (weekly_goal_id, algorithm_id, goal_date),
    CONSTRAINT fk_daily_goal_weekly_goal FOREIGN KEY (weekly_goal_id) REFERENCES weekly_goal(weekly_goal_id) ON DELETE CASCADE,
    CONSTRAINT fk_daily_goal_algorithm FOREIGN KEY (algorithm_id) REFERENCES algorithm(algorithm_id) ON DELETE RESTRICT
);