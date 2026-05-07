import "./CategoryTabs.css";

const CategoryTabs = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div className="categories-list">
      {categories.map((category) => (
        <button
          key={category}
          className={`category-btn ${
            selectedCategory === category ? "active" : ""
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryTabs;