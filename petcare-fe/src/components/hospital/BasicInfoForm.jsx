import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

// eslint-disable-next-line react/prop-types
const BasicInfoForm = ({ formData, setFormData, petTypes, filteredWeights, loading, handleInputChange, mode }) => {
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm({
        defaultValues: formData,
        mode: 'onChange', // Real-time validation
        criteriaMode: 'all', // Capture all validation errors
    });

    // Sync react-hook-form with external formData changes
    useEffect(() => {
        Object.keys(formData).forEach((key) => {
            setValue(key, formData[key], { shouldValidate: true });
        });
    }, [formData, setValue]);

    // Handle form submission
    const onSubmit = (data) => {
        setFormData(data); // Update parent formData
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-lg font-medium text-[#754826]">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Thú Cưng <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('name_pet', {
                            required: 'Vui lòng nhập tên thú cưng',
                            minLength: { value: 2, message: 'Tên thú cưng phải có ít nhất 2 ký tự' },
                            maxLength: { value: 50, message: 'Tên thú cưng không được vượt quá 50 ký tự' },
                            pattern: {
                                value: /^[A-Za-zÀ-ỹ\s]+$/i,
                                message: 'Tên thú cưng chỉ được chứa chữ cái và khoảng trắng',
                            },
                        })}
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('name_pet', e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                            errors.name_pet ? 'border-red-500' : ''
                        }`}
                        placeholder="Nhập tên thú cưng"
                        disabled={loading}
                    />
                    {errors.name_pet && (
                        <p className="text-red-500 text-sm mt-1">{errors.name_pet.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Chủ Nuôi <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('name_boss', {
                            required: 'Vui lòng nhập tên chủ nuôi',
                            minLength: { value: 2, message: 'Tên chủ nuôi phải có ít nhất 2 ký tự' },
                            maxLength: { value: 50, message: 'Tên chủ nuôi không được vượt quá 50 ký tự' },
                            pattern: {
                                value: /^[A-Za-zÀ-ỹ\s]+$/i,
                                message: 'Tên chủ nuôi chỉ được chứa chữ cái và khoảng trắng',
                            },
                        })}
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('name_boss', e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                            errors.name_boss ? 'border-red-500' : ''
                        }`}
                        placeholder="Nhập tên chủ nuôi"
                        disabled={loading}
                    />
                    {errors.name_boss && (
                        <p className="text-red-500 text-sm mt-1">{errors.name_boss.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số Điện Thoại Chủ Nuôi <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        {...register('phone_boss', {
                            required: 'Vui lòng nhập số điện thoại',
                            pattern: {
                                value: /^0[35789][0-9]{8}$/,
                                message: 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, 09 và có đúng 10 chữ số',
                            },
                        })}
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('phone_boss', e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                            errors.phone_boss ? 'border-red-500' : ''
                        }`}
                        placeholder="Nhập số điện thoại (VD: 0912345678)"
                        disabled={loading}
                    />
                    {errors.phone_boss && (
                        <p className="text-red-500 text-sm mt-1">{errors.phone_boss.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Loại Thú Cưng <span className="text-red-500">*</span>
                    </label>
                    <select
                        {...register('pet_type', {
                            required: 'Vui lòng chọn loại thú cưng',
                            validate: (value) =>
                                petTypes.includes(value) || 'Loại thú cưng không hợp lệ',
                        })}
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('pet_type', e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                            errors.pet_type ? 'border-red-500' : ''
                        }`}
                        disabled={loading}
                    >
                        <option value="">Chọn loại thú cưng</option>
                        {petTypes.length > 0 ? (
                            petTypes.map((type, index) => (
                                <option key={index} value={type}>
                                    {type === 'DOG' ? 'Chó' : type === 'CAT' ? 'Mèo' : type}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                Không có loại thú cưng
                            </option>
                        )}
                    </select>
                    {errors.pet_type && (
                        <p className="text-red-500 text-sm mt-1">{errors.pet_type.message}</p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cân Nặng
                    </label>
                    <select
                        {...register('pet_weight_id')} // No validation rules
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('pet_weight_id', e.target.value);
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826]"
                        disabled={loading || filteredWeights.length === 0}
                    >
                        <option value="">Chọn cân nặng</option>
                        {filteredWeights.length > 0 ? (
                            filteredWeights.map((weight) => (
                                <option key={weight.petWeightId} value={weight.petWeightId}>
                                    {weight.weightRange}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>
                                Không có lựa chọn cân nặng
                            </option>
                        )}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tuổi Thú Cưng (năm) <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        {...register('age', {
                            required: 'Vui lòng nhập tuổi thú cưng',
                            min: { value: 0, message: 'Tuổi không thể âm' },
                            max: { value: 30, message: 'Tuổi thú cưng không được vượt quá 30 năm' },
                            validate: {
                                isNumber: (value) =>
                                    !isNaN(value) || 'Vui lòng nhập một số hợp lệ',
                                reasonableAge: (value) =>
                                    Number(value) <= 30 || 'Tuổi thú cưng không hợp lý',
                            },
                        })}
                        onChange={(e) => {
                            handleInputChange(e);
                            setValue('age', e.target.value, { shouldValidate: true });
                        }}
                        className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                            errors.age ? 'border-red-500' : ''
                        }`}
                        placeholder="Nhập tuổi thú cưng (VD: 2.5)"
                        min="0"
                        step="0.1"
                        disabled={loading}
                    />
                    {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age.message}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi Chú</label>
                <textarea
                    {...register('basicNote', {
                        maxLength: {
                            value: 500,
                            message: 'Ghi chú không được vượt quá 500 ký tự',
                        },
                    })}
                    onChange={(e) => {
                        handleInputChange(e);
                        setValue('basicNote', e.target.value, { shouldValidate: true });
                    }}
                    className={`w-full px-4 py-2 rounded-lg border border-[#e8dfd7] focus:outline-none focus:ring-2 focus:ring-[#754826] ${
                        errors.basicNote ? 'border-red-500' : ''
                    }`}
                    placeholder="Nhập ghi chú (nếu có)"
                    rows="3"
                    disabled={loading}
                />
                {errors.basicNote && (
                    <p className="text-red-500 text-sm mt-1">{errors.basicNote.message}</p>
                )}
            </div>
        </form>
    );
};

export default BasicInfoForm;