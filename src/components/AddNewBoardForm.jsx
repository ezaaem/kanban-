import { useContext, useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import TextField from "./TextField";
import iconCross from "@assets/icon-cross.svg";
import { DataContext } from "@/DataContext";

const AddNewBoardForm = ({ toggleDialog, boardId, columns = [], title = "" }) => {
  const { setData, setSelectedBoardIndex } = useContext(DataContext);

  // Ensure columns always have a default structure
  const initialColumns = columns.length ? columns : [{ id: Date.now(), title: "" }];
  const [columnsArray, setColumnsArray] = useState(initialColumns);

  // Handlers
  const removeColumnHandler = (id) => {
    setColumnsArray((prev) => prev.filter((column) => column.id !== id));
  };

  const addNewColumnHandler = () => {
    setColumnsArray((prev) => [...prev, { id: Date.now(), title: "" }]);
  };

  const createNewColumnsArray = (formData) => {
    return columnsArray.map((column) => {
      const tasksArray = boardId && column.tasks ? column.tasks : [];
      return {
        id: column.id,
        title: formData.get(String(column.id)) || "",
        tasks: tasksArray,
      };
    });
  };

  const updateData = (boardName, newColumnsArray) => {
    setData((prev) => {
      // Ensure `prev` is iterable
      if (!Array.isArray(prev)) {
        console.error("Unexpected data structure in DataContext:", prev);
        return [];
      }

      if (boardId) {
        // Update existing board
        return prev.map((board) =>
          board.id === boardId
            ? { ...board, title: boardName, columns: newColumnsArray }
            : board
        );
      } else {
        // Create new board
        const newBoard = {
          id: Date.now(),
          title: boardName,
          columns: newColumnsArray,
        };
        setSelectedBoardIndex(prev.length); // Select the new board
        return [...prev, newBoard];
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const boardName = formData.get("boardName");

    if (!boardName) {
      alert("Board name is required.");
      return;
    }

    const newColumnsArray = createNewColumnsArray(formData);
    updateData(boardName, newColumnsArray);
    toggleDialog(false);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      {/* Board Name */}
      <div>
        <h3 className="pb-2 pt-6 text-body-m text-medium-grey">Board Name</h3>
        <TextField
          placeholder="e.g. Web Design"
          name="boardName"
          defaultValue={title}
          required
        />
      </div>

      {/* Columns */}
      <div className="flex flex-col gap-2">
        <h3 className="pt-6 text-body-m text-medium-grey">Columns</h3>
        {columnsArray.map((column) => (
          <div key={column.id} className="flex items-center gap-4">
            <TextField
              placeholder="e.g. To Do"
              name={String(column.id)}
              defaultValue={column.title}
              required
            />
            <button
              type="button"
              onClick={() => removeColumnHandler(column.id)}
            >
              <img src={iconCross} alt="Remove Column" />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addNewColumnHandler}
        >
          + Add New Column
        </Button>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <Button type="submit" variant="primary" size="sm" isFullWidth>
          {boardId ? "Update Board" : "Create New Board"}
        </Button>
      </div>
    </form>
  );
};

AddNewBoardForm.propTypes = {
  toggleDialog: PropTypes.func.isRequired,
  boardId: PropTypes.number,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string,
      tasks: PropTypes.array,
    })
  ),
  title: PropTypes.string,
};

export default AddNewBoardForm;
