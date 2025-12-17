function TextInput({ value, onChange }) {
  const handleChange = (event) => {
    onChange?.(event.target.value)
  }

  return (
    <div className="panel text-input">
      <div className="panel-title">Sentence</div>
      <textarea
        value={value}
        onChange={handleChange}
        placeholder="Describe the universe you want to see..."
        rows={6}
      />
    </div>
  )
}

export default TextInput

