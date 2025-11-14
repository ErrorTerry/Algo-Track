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
    definition TEXT NOT NULL,
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

-- 목표
CREATE TABLE goal (
    goal_id INT GENERATED ALWAYS AS IDENTITY,
    user_id INT NOT NULL,
    goal_period TEXT NOT NULL DEFAULT 'week' CHECK (goal_period in ('week', 'day')),
    created_at DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT pk_goal PRIMARY KEY (goal_id),
    CONSTRAINT fk_goal_users FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 목표 알고리즘
CREATE TABLE goal_algorithm (
    goal_algorithm_id INT GENERATED ALWAYS AS IDENTITY,
    goal_id INT NOT NULL,
    algorithm_id INT NOT NULL,
    goal_problem INT NOT NULL CHECK (goal_problem >= 0),
    solve_problem INT NOT NULL DEFAULT 0 CHECK (solve_problem >= 0 AND solve_problem <= goal_problem),
    CONSTRAINT pk_goal_algorithm PRIMARY KEY (goal_algorithm_id),
    CONSTRAINT uq_goal_algorithm UNIQUE (goal_id, algorithm_id),
    CONSTRAINT fk_goal_algorithm_goal FOREIGN KEY (goal_id) REFERENCES goal(goal_id) ON DELETE CASCADE,
    CONSTRAINT fk_goal_algorithm_algorithm FOREIGN KEY (algorithm_id) REFERENCES algorithm(algorithm_id) ON DELETE RESTRICT
);