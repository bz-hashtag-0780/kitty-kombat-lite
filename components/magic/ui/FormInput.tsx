import React from 'react';

interface Props {
	value: string;
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	placeholder: string;
}

const FormInput = ({ value, onChange, placeholder }: Props) => {
	return (
		<input
			className="form-input text-black"
			value={value}
			onChange={onChange}
			placeholder={placeholder}
		/>
	);
};

export default FormInput;
