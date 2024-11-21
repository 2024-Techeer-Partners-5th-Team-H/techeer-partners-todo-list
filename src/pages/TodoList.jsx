import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import plus from '../assets/images/plus.png';
import notyet from '../assets/images/notyet.png';
import trash from '../assets/images/trash.png';
import completed from '../assets/images/completed.png';

function TodoList() {
  const [todo, setTodo] = useState('');
  const [todoList, setTodoList] = useState([]);
  const [filter, setFilter] = useState('all'); // 필터 상태

  // 할 일 목록을 조회하는 함수
  const fetchTasks = async (filterPath = '') => {
    try {
      const url = `http://localhost:8080/tasks${filterPath}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('할 일 조회 실패');
      }

      const data = await response.json();
      console.log('할 일 조회 성공:', data);

      setTodoList(
        data.data.content.map((task) => ({
          id: task.taskId,
          text: task.title,
          done: task.done,
        })),
      );
    } catch (error) {
      console.error('할 일 조회 중 오류 발생:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);

    switch (newFilter) {
      case 'completed':
        fetchTasks('/completed');
        break;
      case 'notcompleted':
        fetchTasks('/incomplete');
        break;
      default:
        fetchTasks();
    }
  };

  // 할 일 추가 함수
  const handleAddTodo = async () => {
    if (todo.trim()) {
      try {
        const response = await fetch('http://localhost:8080/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title: todo }),
        });

        if (!response.ok) {
          throw new Error('응답이 실패했습니다.');
        }

        console.log(
          '할 일이 성공적으로 추가되었습니다:',
          await response.json(),
        );

        // 전체 할 일 목록 다시 조회
        fetchTasks();
      } catch (error) {
        console.error('할 일 추가 중 오류 발생:', error);
      }

      setTodo('');
    }
  };

  // 할 일 수정 함수
  const handleCompleteEdit = async (id, currentTitle, currentDone) => {
    const updatedDone = !currentDone; // 완료 상태 반전

    try {
      const response = await fetch(`http://localhost:8080/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentTitle,
          isDone: updatedDone,
        }),
      });

      if (!response.ok) {
        throw new Error('할 일 완료 상태 수정 실패');
      }

      console.log('할 일 상태 수정 성공');

      handleFilterChange(filter);
    } catch (error) {
      console.error('할 일 상태 수정 중 오류 발생:', error);
    }
  };

  // 할 일 삭제 함수
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('할 일 삭제 실패');
      }

      console.log('할 일 삭제 성공');

      handleFilterChange(filter);
    } catch (error) {
      console.error('할 일 삭제 중 오류 발생:', error);
    }
  };

  return (
    <Background>
      <ListContainer>
        <Wrapper>
          <Title>Todo List</Title>
          <InputWrapper>
            <TodoInput
              value={todo}
              onChange={(e) => setTodo(e.target.value)}
              placeholder="  Add a new Task ..."
            />
            <PlusButton onClick={handleAddTodo}>
              <PlusImage src={plus} alt="plus" />
            </PlusButton>
          </InputWrapper>

          {/* 필터 버튼 그룹 */}
          <ButtonGroup>
            <FilterButton
              onClick={() => handleFilterChange('all')}
              active={filter === 'all'}>
              전체
            </FilterButton>
            <FilterButton
              onClick={() => handleFilterChange('completed')}
              active={filter === 'completed'}>
              완료
            </FilterButton>
            <FilterButton
              onClick={() => handleFilterChange('notcompleted')}
              active={filter === 'notcompleted'}>
              미완료
            </FilterButton>
          </ButtonGroup>
          <TodoListContainer>
            {todoList.map((todoItem) => (
              <TodoItem key={todoItem.id}>
                <Actions>
                  <ActionButton
                    onClick={() =>
                      handleCompleteEdit(
                        todoItem.id,
                        todoItem.text,
                        todoItem.done,
                      )
                    }>
                    <img
                      src={todoItem.done ? completed : notyet}
                      alt={todoItem.done ? 'completed' : 'notyet'}
                    />
                  </ActionButton>
                </Actions>
                <TodoText done={todoItem.done}>{todoItem.text}</TodoText>
                <Actions>
                  <ActionButton onClick={() => handleDelete(todoItem.id)}>
                    <img src={trash} alt="trash" />
                  </ActionButton>
                </Actions>
              </TodoItem>
            ))}
          </TodoListContainer>
        </Wrapper>
      </ListContainer>
    </Background>
  );
}

export default TodoList;

const Background = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(145deg, #a6c0fe 0%, #cda1c2 50%, #f68084 100%);
  background-repeat: no-repeat;
`;

const ListContainer = styled.div`
  display: flex;
  width: 41.125rem;
  height: 46rem;
  background-color: white;
  border-radius: 1.875rem;
`;

const Title = styled.h1`
  font-size: 2.25rem;
  color: black;
  font-weight: 600;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding-top: 2.5rem;
  max-width: 34rem;
  margin: 0 auto;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const TodoInput = styled.input`
  width: 29rem;
  height: 2.75rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.3rem;
  outline: none;
  box-sizing: border-box;
  padding: 0 0.94;
  margin-right: 0.5rem;

  &::placeholder {
    color: #d9d9d9;
  }

  &:focus::placeholder {
    color: transparent;
  }
`;

const PlusButton = styled.button`
  background-color: black;
  border-radius: 0.3rem;
  width: 3.5rem;
  height: 2.75rem;
  cursor: pointer;
`;

const PlusImage = styled.img`
  width: 1.5rem;
  height: 1.5rem;
`;

// 여기까지 세션 내용

const TodoListContainer = styled.div`
  width: 100%;
  margin-top: 1rem;
`;

const TodoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
`;

const TodoText = styled.span`
  text-decoration: ${(props) => (props.done ? 'line-through' : 'none')};
  color: ${(props) => (props.done ? '#d9d9d9' : 'black')};
  font-size: 1rem;
  flex-grow: 1;
  margin-left: 1rem;
  text-align: left;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;

  img {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: left;
  width: 100%;
  margin-top: 1rem;
  margin-left: 1rem;
  padding: 0.5rem;
  border-radius: 20px;
`;

const FilterButton = styled.button`
  background: ${(props) => (props.active ? 'black' : '#d9d9d9')};
  color: white;
  border: 1px solid #ddd;
  padding: 0.5rem 1.4rem;
  margin-right: 0.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: ${(props) => (props.active ? 'black' : '#aaa')};
  }
`;
